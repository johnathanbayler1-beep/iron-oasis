import { NextRequest, NextResponse } from "next/server";

/**
 * Analytics event logging for server-side form submissions
 * In production, this would send to analytics backend
 */
function logAnalyticsEvent(eventName: string, eventData: Record<string, any>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, eventData);
  }
  // TODO: Send to analytics service (Vercel Analytics, PostHog, etc.)
}

interface SubmissionData {
  name: string;
  email: string;
  phone: string;
  fitnessGoal: string;
  trainingExperience: string;
  commitmentLevel: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone format (at least 10 digits)
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

// In-memory storage for MVP (replace with DB in Phase 2)
const submissions: Array<SubmissionData & { timestamp: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, fitnessGoal, trainingExperience, commitmentLevel } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || !isValidPhone(phone)) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }

    if (!fitnessGoal || typeof fitnessGoal !== "string" || !fitnessGoal.trim()) {
      return NextResponse.json({ error: "Fitness goal is required" }, { status: 400 });
    }

    if (!trainingExperience || typeof trainingExperience !== "string" || !trainingExperience.trim()) {
      return NextResponse.json({ error: "Training experience is required" }, { status: 400 });
    }

    if (!commitmentLevel || typeof commitmentLevel !== "string" || !commitmentLevel.trim()) {
      return NextResponse.json({ error: "Commitment level is required" }, { status: 400 });
    }

    // Store submission (MVP in-memory, replace with DB in Phase 2)
    const submission = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      fitnessGoal,
      trainingExperience,
      commitmentLevel,
      timestamp: new Date().toISOString(),
    };

    submissions.push(submission);

    // Log to console for debugging
    console.log("New application submitted:", submission);

    // Track form completion event
    logAnalyticsEvent("form_submit_success", {
      email: submission.email,
      fitnessGoal: submission.fitnessGoal,
      trainingExperience: submission.trainingExperience,
      commitmentLevel: submission.commitmentLevel,
      timestamp: submission.timestamp,
    });

    // In Phase 2, send emails here using Resend or SendGrid
    // TODO: Send applicant confirmation email
    // TODO: Send operator notification email

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data: { email: submission.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    logAnalyticsEvent("form_submit_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint to verify API is working (remove in production)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    totalSubmissions: submissions.length,
  });
}
