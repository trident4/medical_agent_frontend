import { PaginatedResponse } from "@/commontypes";

export interface Patient {
  id: number;
  patient_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  age: number;
  last_visit: string | null;
  visit_count: number;
}

export type PatientResponse = PaginatedResponse<Patient>;

// {
//     "items": [
//         {
//             "id": 1,
//             "patient_id": "PAT001",
//             "full_name": "John Smith",
//             "age": 40,
//             "last_visit": "2025-11-12T00:00:00",
//             "visit_count": 6
//         },
//         {
//             "id": 2,
//             "patient_id": "PAT002",
//             "full_name": "Sarah Johnson",
//             "age": 33,
//             "last_visit": "2025-09-14T23:36:24.527185",
//             "visit_count": 1
//         },
//         {
//             "id": 3,
//             "patient_id": "PAT003",
//             "full_name": "Robert Davis",
//             "age": 46,
//             "last_visit": "2025-08-15T23:36:24.527193",
//             "visit_count": 1
//         },
//         {
//             "id": 4,
//             "patient_id": "PAT004",
//             "full_name": "Emily Chen",
//             "age": 30,
//             "last_visit": "2025-09-19T23:36:24.527203",
//             "visit_count": 1
//         },
//         {
//             "id": 5,
//             "patient_id": "PAT005",
//             "full_name": "Michael Brown",
//             "age": 60,
//             "last_visit": "2025-09-22T23:36:24.527210",
//             "visit_count": 1
//         },
//         {
//             "id": 7,
//             "patient_id": "PAT006",
//             "full_name": "Maria Rodriguez",
//             "age": 35,
//             "last_visit": null,
//             "visit_count": 0
//         },
//         {
//             "id": 8,
//             "patient_id": "PAT007",
//             "full_name": "James Wilson",
//             "age": 53,
//             "last_visit": null,
//             "visit_count": 0
//         },
//         {
//             "id": 9,
//             "patient_id": "PAT008",
//             "full_name": "Lisa Kim",
//             "age": 37,
//             "last_visit": null,
//             "visit_count": 0
//         },
//         {
//             "id": 10,
//             "patient_id": "API-TEST-001",
//             "full_name": "Alice TestPatient",
//             "age": 35,
//             "last_visit": "2025-01-15T14:00:00",
//             "visit_count": 2
//         },
//         {
//             "id": 11,
//             "patient_id": "TEST-20251001_195924",
//             "full_name": "Alice TestPatient",
//             "age": 35,
//             "last_visit": null,
//             "visit_count": 0
//         }
//     ],
//     "total": 22,
//     "page": 1,
//     "page_size": 10,
//     "total_pages": 3,
//     "has_next": true,
//     "has_previous": false
// }
