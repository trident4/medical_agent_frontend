import { BASE_BACKEND_URL } from "@/constants";
import { do_post, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// {
//     "patient_id": "PAT001",
//     "summary": "**Comprehensive Health Summary for John Smith:**\n\nJohn Smith, born on March 15, 1985, has a medical history notable for hypertension diagnosed in 2018 and a family history of diabetes. He has allergies to penicillin (severe reaction) and shellfish (mild reaction). Currently, he is on Lisinopril 10mg daily for hypertension and Metformin 500mg twice daily for diabetes management.\n\n**Recent Medical Visits:**\n\n1. **Visit on October 27, 2025:**\n   - **Chief Complaint:** Routine diabetes check-up with concerns about elevated blood sugar levels.\n   - **Diagnosis:** Type 2 Diabetes Mellitus with inadequate glycemic control.\n   - **Treatment:** No new treatment prescribed during this visit.\n\n2. **Visit on August 30, 2025:**\n   - **Chief Complaint:** Routine hypertension follow-up.\n   - **Diagnosis:** Essential hypertension, noted to be well controlled.\n   - **Treatment:** No changes to current medication regimen.\n\n**Sources and References:**\n- Patient's medical record entries for visits on 2025-10-27 and 2025-08-30.\n- Patient's medical history and current medication list from the provided patient information.\n\n**Confidence Assessment:**\n- Confidence level: 1.0, as the information provided is directly from the patient's medical records.\n\n**Context Clarification:**\n- The summary is based solely on the data provided and does not include any external information or assumptions. For further details or any changes in the patient's condition post these visits, additional records or a consultation with a healthcare provider would be necessary.\n\n**Follow-Up Suggestions:**\n- Given the inadequate glycemic control noted during the last visit, it might be beneficial to schedule a follow-up to review and possibly adjust the diabetes management plan.\n- Consider discussing with the patient about lifestyle modifications or additional monitoring to better manage both hypertension and diabetes.\n\nPlease note that while this summary provides a comprehensive overview based on the given data, any medical decisions or further inquiries should be handled by a qualified healthcare professional to ensure compliance with medical standards and patient privacy laws.",
//     "health_trends": [
//         "Overall health stable",
//         "Regular follow-ups maintained"
//     ],
//     "risk_factors": [
//         "Monitor blood pressure",
//         "Continue medication compliance"
//     ],
//     "recommendations": [
//         "Schedule annual physical",
//         "Update vaccination records"
//     ],
//     "recent_visits_count": 2,
//     "last_visit_date": "2025-10-27T09:45:00",
//     "generated_at": "2025-11-01T05:19:06.013987"
// }

export async function POST(Request: Request) {
  try {
    const body = await Request.json();
    const token = (await cookies()).get("token")?.value || "";
    let patients = await do_post(
      `${BASE_BACKEND_URL}/api/v1/agents/health-summary`,
      body,
      get_auth(token)
    );
    return NextResponse.json(patients);
  } catch (error: any) {
    // Check if it's our custom HttpError
    if (error.status) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    // For other errors, return 500
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
