"use client";

import { useState, useEffect } from "react";
import { trackEvent, trackFormInteraction } from "@/lib/analytics";

interface FormData {
  name: string;
  email: string;
  phone: string;
  sessionFocus: string;
  experienceLevel: string;
  commitmentLevel: string;
}

interface MembershipFormProps {
  onSuccess: () => void;
}

export default function MembershipForm({ onSuccess }: MembershipFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    sessionFocus: "",
    experienceLevel: "",
    commitmentLevel: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Track form start on mount
  useEffect(() => {
    trackEvent({
      event: 'form_start',
      label: 'membership_form',
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone) || formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.sessionFocus) newErrors.sessionFocus = "Session goal is required";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Experience level is required";
    if (!formData.commitmentLevel) newErrors.commitmentLevel = "Commitment level is required";

    setErrors(newErrors);

    // Track validation errors
    Object.entries(newErrors).forEach(([fieldName, errorMessage]) => {
      trackFormInteraction('membership_form', fieldName, 'error', errorMessage);
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError("");

    // Track form submission attempt
    trackEvent({
      event: 'form_submit_attempt',
      label: 'membership_form',
    });

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Submission failed. Please try again.";
        setSubmitError(errorMsg);

        // Track submission error
        trackEvent({
          event: 'form_submit_error',
          label: 'membership_form',
          value: errorMsg,
        });
        return;
      }

      // Track successful submission
      trackEvent({
        event: 'form_submit_success',
        label: 'membership_form',
        value: formData.email,
      });

      onSuccess();
    } catch (error) {
      const errorMsg = "An error occurred. Please try again.";
      setSubmitError(errorMsg);

      // Track submission error
      trackEvent({
        event: 'form_submit_error',
        label: 'membership_form',
        value: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/15 rounded-[8px] px-4 py-3 text-white placeholder-[#b8b8b8]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200 text-[14px]";

  const labelClass = "block text-[13px] font-medium text-[#b8b8b8] mb-2";

  const errorClass = "block text-[12px] text-red-400/80 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          className={inputClass}
        />
        {errors.name && <span className={errorClass}>{errors.name}</span>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={inputClass}
        />
        {errors.email && <span className={errorClass}>{errors.email}</span>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className={inputClass}
        />
        {errors.phone && <span className={errorClass}>{errors.phone}</span>}
      </div>

      {/* Fitness Goal */}
      <div>
        <label htmlFor="sessionFocus" className={labelClass}>
          How will you use your sessions?
        </label>
        <select
          id="sessionFocus"
          name="sessionFocus"
          value={formData.sessionFocus}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select an option</option>
          <option value="strength">Strength-focused sessions</option>
          <option value="endurance">Conditioning</option>
          <option value="flexibility">Mobility & recovery</option>
          <option value="weight">Weight management</option>
          <option value="sport">Sport-specific sessions</option>
          <option value="general">General sessions</option>
        </select>
        {errors.sessionFocus && <span className={errorClass}>{errors.sessionFocus}</span>}
      </div>

      {/* Training Experience */}
      <div>
        <label htmlFor="experienceLevel" className={labelClass}>
          Experience level
        </label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select experience level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="athlete">Highly experienced</option>
        </select>
        {errors.experienceLevel && <span className={errorClass}>{errors.experienceLevel}</span>}
      </div>

      {/* Commitment Level */}
      <div>
        <label htmlFor="commitmentLevel" className={labelClass}>
          Sessions per week
        </label>
        <select
          id="commitmentLevel"
          name="commitmentLevel"
          value={formData.commitmentLevel}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select frequency</option>
          <option value="3x">3x per week</option>
          <option value="4x">4x per week</option>
          <option value="5x">5+ per week</option>
        </select>
        {errors.commitmentLevel && <span className={errorClass}>{errors.commitmentLevel}</span>}
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="rounded-[8px] border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13px] text-red-400">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full border border-white/10 bg-white px-6 py-3 font-sans text-sm font-medium tracking-[0.02em] text-zinc-900 transition-all duration-300 hover:border-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting..." : "Get Access Key"}
      </button>

      <p className="text-center text-[12px] font-light text-[#b8b8b8]/60">
        We typically respond within 48 hours.
      </p>
    </form>
  );
}
