### University Schema

- **Fields:**
  - `name`: Name of the university.
  - `email`: Email of the university.
  - `location`: Location of the university.
  - `departments`: Array of department names.
  - `AuthId`: Authentication identifier for the university.

### Student Schema

- **Fields:**

  - `matriculationNumber`: Unique identifier for each student.
  - `university`: Reference to the `University` schema.
  - `name`: Name of the student.
  - `level`: Academic level of the student.
  - `email`: Email of the student.
  - `department`: Department in which the student is enrolled.
  - `AuthId`: Authentication identifier for the student.

- **Relationships:**
  - Each student is associated with one university (via the `university` field).

### CourseFeedbackForm Schema

- **Fields:**

  - `courseCode`: Code for the course.
  - `lecturerName`: Name of the course lecturer.
  - `university`: Reference to the `University` schema.
  - `level`: Academic level of the course.
  - `department`: Department to which the course belongs.
  - `evaluationFeedback`: Array of references to `StudentFeedback` schema.
  - `numberOfSubmissions`: Number of feedback submissions for the course.

- **Relationships:**
  - Each course feedback form is associated with one university (via the `university` field).
  - Each course feedback form can have multiple student feedbacks (via the `evaluationFeedback` array).

### StudentFeedback Schema

- **Fields:**

  - `matriculationNumber`: Matriculation number of the student providing feedback.
  - `evaluationComment`: Comment provided by the student for course evaluation.
  - `evaluationAspect`: Aspect considered by the student for course evaluation.
  - `courseFeedbackForm`: Reference to the `CourseFeedbackForm` schema.

- **Relationships:**
  - Each student feedback is associated with one course feedback form (via the `courseFeedbackForm` field).
