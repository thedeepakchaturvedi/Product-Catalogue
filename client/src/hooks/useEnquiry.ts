import { useMutation } from "@tanstack/react-query";
import { submitEnquiry } from "../api/client.js";
import type { EnquiryFormData, EnquiryResponse } from "../types/index.js";

export function useEnquiryMutation() {
  return useMutation<EnquiryResponse, Error, EnquiryFormData>({
    mutationFn: (data: EnquiryFormData) => submitEnquiry(data),
  });
}
