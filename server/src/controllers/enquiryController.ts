import type { Request, Response, NextFunction } from "express";
import type { EnquiryService } from "../services/enquiryService.js";
import type { EnquiryRequest } from "../types/index.js";
import { ProviderError } from "../types/index.js";

export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  submitEnquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const enquiryData = req.body as EnquiryRequest;
      const result = await this.enquiryService.submitEnquiry(enquiryData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({
          success: false,
          error: {
            message: "Product not found",
          },
        });
        return;
      }

      if (error instanceof ProviderError) {
        res.status(502).json({
          success: false,
          error: {
            message: "Unable to send enquiry. Please try again later.",
          },
        });
        return;
      }

      next(error);
    }
  };
}
