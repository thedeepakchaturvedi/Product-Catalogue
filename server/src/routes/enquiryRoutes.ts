import { Router } from "express";
import type { EnquiryController } from "../controllers/enquiryController.js";
import { validateBody } from "../middleware/validateBody.js";
import { enquirySchema } from "../validation/enquiry.js";

export function createEnquiryRouter(controller: EnquiryController): Router {
  const router = Router();

  router.post("/enquiries", validateBody(enquirySchema), controller.submitEnquiry);

  return router;
}
