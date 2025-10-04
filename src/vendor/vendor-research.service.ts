import { EntityManager, EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LLM as LLMClient } from '@themaximalist/llm.js'
import { Vendor } from '../entities/vendor.entity'
import { VendorResearch, VendorResearchStatus } from '../entities/vendor-research.entity'

// Service orchestrates the end-to-end AI research workflow for a vendor, including
// scraping website context, invoking the LLM, and persisting results for review.

type WebsiteExtractionResult = {
  snapshot?: Record<string, unknown>
  profileCandidates?: Record<string, unknown>
  logoUrl?: string
}

@Injectable()
export class VendorResearchService {
  private readonly logger = new Logger(VendorResearchService.name)
  private readonly llm: InstanceType<typeof LLMClient>
  private readonly llmModel: string

  constructor(
    @InjectRepository(VendorResearch)
    private readonly vendorResearchRepository: EntityRepository<VendorResearch>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    private readonly em: EntityManager,
  ) {
    this.llm = new LLMClient({
      apiKey: process.env.OPENAI_API_KEY ?? 'REPLACE_ME_WITH_REAL_LLM_API_KEY',
    })
    this.llmModel = process.env.LLM_RESEARCH_MODEL ?? 'openai:gpt-4o-mini'
  }

  // Creates a research job for a vendor and seeds required metadata on the record.
  async createResearchRequest(vendorId: number): Promise<VendorResearch> {
    const vendor = await this.vendorRepository.findOne(vendorId, { populate: ['profile'] })
    if (!vendor) {
      throw new NotFoundException('Vendor not found')
    }

    const research = this.vendorResearchRepository.create({
      vendor,
      websiteUrl: vendor.website,
      status: VendorResearchStatus.PENDING,
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await this.em.persistAndFlush(research)
    return research
  }

  // Drives the queued job through scrape + LLM enrichment, handling failures gracefully.
  async processResearch(researchId: number): Promise<void> {
    const research = await this.vendorResearchRepository.findOne(researchId, {
      populate: ['vendor', 'vendor.profile'],
    })

    if (!research) {
      this.logger.warn(`Vendor research ${researchId} not found when processing`)
      return
    }

    research.status = VendorResearchStatus.IN_PROGRESS
    research.startedAt = new Date()
    await this.em.flush()

    try {
      const websiteResult = await this.captureWebsiteContext(research.vendor, research.websiteUrl)
      research.websiteSnapshot = websiteResult.snapshot
      research.extractedProfile = websiteResult.profileCandidates
      if (websiteResult.logoUrl) {
        research.discoveredLogoUrl = websiteResult.logoUrl
      }

      const insights = await this.performDeepResearch(research.vendor, {
        websiteSnapshot: websiteResult.snapshot,
        candidates: websiteResult.profileCandidates,
      })
      research.deepResearchInsights = insights
      research.llmModel = this.llmModel

      research.status = VendorResearchStatus.COMPLETED
      research.completedAt = new Date()
    } catch (error) {
      research.status = VendorResearchStatus.FAILED
      research.errorMessage = error instanceof Error ? error.message : 'Unknown research error'
      research.completedAt = new Date()
      this.logger.error(`Vendor research ${researchId} failed`, error instanceof Error ? error.stack : undefined)
    } finally {
      await this.em.flush()
    }
  }

  // Returns chronological research history so the UI can show previous runs.
  async listResearchForVendor(vendorId: number): Promise<VendorResearch[]> {
    return this.vendorResearchRepository.find(
      { vendor: vendorId },
      {
        populate: ['vendor'],
        orderBy: { createdAt: 'DESC' },
      },
    )
  }

  // Retrieves a single research record including vendor context for deep inspection.
  async getResearchById(vendorId: number, researchId: number): Promise<VendorResearch | null> {
    const research = await this.vendorResearchRepository.findOne(
      { id: researchId, vendor: vendorId },
      { populate: ['vendor', 'vendor.profile'] },
    )

    if (!research) {
      throw new NotFoundException('Research request not found')
    }

    return research
  }

  // Fetches the vendor website and extracts lightweight structured hints for the LLM.
  async captureWebsiteContext(vendor: Vendor, websiteUrl?: string): Promise<WebsiteExtractionResult> {
    if (!websiteUrl) {
      return {}
    }

    try {
      const response = await fetch(websiteUrl, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`Website responded with status ${response.status}`)
      }
      const html = await response.text()

      const structuredData = this.extractStructuredData(html)
      const logoUrl = this.extractLogoUrl(html, websiteUrl)

      const candidateProfile = this.deriveProfileCandidates(structuredData, html)

      return {
        snapshot: {
          title: this.extractHtmlTitle(html),
          metaDescription: this.extractMetaDescription(html),
          rawHtmlSample: html.substring(0, 5000),
        },
        profileCandidates: candidateProfile,
        logoUrl,
      }
    } catch (error) {
      this.logger.warn(`Failed to scrape website for vendor ${vendor.id}: ${error instanceof Error ? error.message : error}`)
      return {}
    }
  }

  // Pulls out JSON-LD blobs that often contain company metadata.
  private extractStructuredData(html: string): Record<string, unknown>[] {
    const matches = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi))
    const results: Record<string, unknown>[] = []
    for (const match of matches) {
      try {
        const json = JSON.parse(match[1])
        if (Array.isArray(json)) {
          results.push(...json)
        } else {
          results.push(json)
        }
      } catch (error) {
        this.logger.debug(`Failed to parse ld+json block: ${error instanceof Error ? error.message : error}`)
      }
    }
    return results
  }

  // Attempts to find a favicon or open graph image that works as a logo source.
  private extractLogoUrl(html: string, baseUrl: string): string | undefined {
    const linkMatch = html.match(/<link[^>]+rel="(?:apple-touch-icon|icon|shortcut icon)"[^>]+href="([^"]+)"/i)
    if (linkMatch?.[1]) {
      return this.normalizeUrl(linkMatch[1], baseUrl)
    }

    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    if (ogMatch?.[1]) {
      return this.normalizeUrl(ogMatch[1], baseUrl)
    }

    return undefined
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).toString()
    } catch (error) {
      this.logger.debug(`Failed to normalise url ${url}: ${error instanceof Error ? error.message : error}`)
      return url
    }
  }

  private extractHtmlTitle(html: string): string | undefined {
    const match = html.match(/<title>(.*?)<\/title>/i)
    return match?.[1]?.trim()
  }

  private extractMetaDescription(html: string): string | undefined {
    const match = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)
    return match?.[1]?.trim()
  }

  // Builds a helper object of scraped hints to inform the downstream LLM prompt.
  private deriveProfileCandidates(structuredData: Record<string, unknown>[], html: string): Record<string, unknown> | undefined {
    const organization = structuredData.find((item) =>
      typeof item === 'object' && item !== null && 'type' in item && (item as Record<string, unknown>).type === 'Organization'
    ) as Record<string, unknown> | undefined

    const keywords = this.extractMetaKeywords(html)

    return {
      structuredData: organization ?? structuredData[0],
      keywords,
    }
  }

  private extractMetaKeywords(html: string): string[] | undefined {
    const match = html.match(/<meta[^>]+name="keywords"[^>]+content="([^"]*)"/i)
    if (!match?.[1]) return undefined
    return match[1]
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
  }

  // Sends the aggregated context to the configured LLM and normalizes the response.
  private async performDeepResearch(
    vendor: Vendor,
    context: { websiteSnapshot?: Record<string, unknown>; candidates?: Record<string, unknown> },
  ): Promise<Record<string, unknown> | undefined> {
    try {
      const prompt = this.buildResearchPrompt(vendor, context)
      const rawResult = (await this.llm.chat(prompt, {
        model: this.llmModel,
        json: true,
      })) as unknown

      if (typeof rawResult === 'string') {
        return JSON.parse(rawResult)
      }

      if (rawResult && typeof (rawResult as { content?: unknown }).content === 'string') {
        return JSON.parse((rawResult as { content: string }).content)
      }

      if (rawResult && typeof rawResult === 'object' && !('next' in (rawResult as object))) {
        return rawResult as Record<string, unknown>
      }

      return undefined
    } catch (error) {
      this.logger.warn(`Deep research prompt failed for vendor ${vendor.id}: ${error instanceof Error ? error.message : error}`)
      return undefined
    }
  }

  // Generates a deterministic instruction string to guide the LLM output.
  private buildResearchPrompt(
    vendor: Vendor,
    context: { websiteSnapshot?: Record<string, unknown>; candidates?: Record<string, unknown> },
  ): string {
    const snapshotSummary = JSON.stringify(context.websiteSnapshot ?? {})
    const candidateSummary = JSON.stringify(context.candidates ?? {})

    return [
      'You are an analyst enriching a vendor directory for banks and other financial institutions.',
      'Your main goal is to provide the most accurate and comprehensive information about the vendor.',
      'Do not assume any information—only use the details provided. If data is not available, return null and do not fabricate it.',
      `The vendor is ${vendor.companyName} with website ${vendor.website ?? 'unknown'}.`,
      '',
      'Website snapshot data:',
      snapshotSummary,
      '',
      'Candidate structured data:',
      candidateSummary,
      '',
      'Return a minified JSON object with the following shape:',
      '{',
      '  "summary": string,',
      '  "detailedDescription": string,',
      '  "category": string,',
      '  "subcategories": string[],',
      '  "location": string,',
      '  "size": string,',
      '  "founded": string,',
      '  "employees": string,',
      '  "phone": string,',
      '  "email": string,',
      '  "targetCustomers": string[],',
      '  "notableCustomers": string[],',
      '  "features": string[],',
      '  "integrations": string[],',
      '  "pricingModel": string,',
      '  "pricingNotes": string,',
      '  "sources": [{"label": string, "url": string}]',
      '}',
      'If information cannot be found set the field to null instead of guessing.',
    ].join('\n')
  }
}
