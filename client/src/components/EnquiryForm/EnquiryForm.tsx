import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnquiryMutation } from "../../hooks/useEnquiry.js";
import { enquiryFormSchema } from "../../validation/enquiry.js";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner.js";
import styles from "./EnquiryForm.module.css";

interface EnquiryFormProps {
  readonly productId: number;
  readonly productTitle: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  productId,
  productTitle,
}) => {
  const navigate = useNavigate();
  const enquiryMutation = useEnquiryMutation();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = enquiryFormSchema.safeParse(form);

    if (!validation.success) {
      const errors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    enquiryMutation.mutate(
      {
        productId,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        email: validation.data.email,
        phone: validation.data.phone || undefined,
        message: validation.data.message,
      },
      {
        onSuccess: () => {
          navigate("/thank-you", {
            state: { submitted: true, productTitle },
          });
        },
      }
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {enquiryMutation.isError && (
        <div className={styles.errorBannerWrapper}>
          <ErrorBanner
            message={
              enquiryMutation.error?.message ||
              "Unable to submit enquiry. Please try again."
            }
          />
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>
            First Name <span className={styles.required}>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            disabled={enquiryMutation.isPending}
            className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ""}`}
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
            required
            maxLength={100}
          />
          {fieldErrors.firstName && (
            <span id="firstName-error" className={styles.errorText}>
              {fieldErrors.firstName}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name <span className={styles.required}>*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            disabled={enquiryMutation.isPending}
            className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ""}`}
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
            required
            maxLength={100}
          />
          {fieldErrors.lastName && (
            <span id="lastName-error" className={styles.errorText}>
              {fieldErrors.lastName}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email Address <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={enquiryMutation.isPending}
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
            maxLength={254}
          />
          {fieldErrors.email && (
            <span id="email-error" className={styles.errorText}>
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={enquiryMutation.isPending}
            className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ""}`}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            maxLength={20}
          />
          {fieldErrors.phone && (
            <span id="phone-error" className={styles.errorText}>
              {fieldErrors.phone}
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          disabled={enquiryMutation.isPending}
          className={`${styles.textarea} ${fieldErrors.message ? styles.inputError : ""}`}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          required
          maxLength={1000}
          placeholder="Please let us know your requirements, quantity needed, or any questions..."
        />
        {fieldErrors.message && (
          <span id="message-error" className={styles.errorText}>
            {fieldErrors.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={enquiryMutation.isPending}
        className={styles.submitButton}
        aria-busy={enquiryMutation.isPending}
      >
        {enquiryMutation.isPending ? "Submitting Enquiry..." : "Submit Enquiry"}
      </button>
    </form>
  );
};
