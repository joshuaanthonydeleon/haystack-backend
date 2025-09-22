import { Injectable, Logger } from '@nestjs/common'
import { VendorResearchService } from './vendor-research.service'

@Injectable()
export class VendorResearchQueue {
  private readonly logger = new Logger(VendorResearchQueue.name)
  private queue: number[] = []
  private processing = false

  constructor(private readonly vendorResearchService: VendorResearchService) {}

  async enqueue(researchId: number) {
    this.queue.push(researchId)
    this.logger.debug(`Queued vendor research ${researchId}. Queue size: ${this.queue.length}`)
    void this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const researchId = this.queue.shift()!
      try {
        this.logger.log(`Processing vendor research ${researchId}`)
        await this.vendorResearchService.processResearch(researchId)
        this.logger.log(`Completed vendor research ${researchId}`)
      } catch (error) {
        this.logger.error(`Failed processing vendor research ${researchId}`, error instanceof Error ? error.stack : undefined)
      }
    }

    this.processing = false
  }
}

