# Requirements Document

## Introduction

The AI Resume Builder allows a user to upload an existing resume file, automatically extract its content into a structured, editable format, evaluate that content against Applicant Tracking System (ATS) criteria, and generate an AI-enhanced version of the resume optimized for ATS scoring. The user can edit both the originally extracted resume content and the AI-enhanced version directly within the application. The system is built on Next.js for the frontend and backend, and Supabase for authentication, database, and file storage.

## Glossary

- **User**: An authenticated individual using the application to build or improve a resume.
- **Resume_File**: The original file (PDF or DOCX) uploaded by the User.
- **Resume_Parser**: The component responsible for extracting structured content (sections, contact info, work experience, education, skills, etc.) from a Resume_File.
- **Resume_Document**: The structured, in-app representation of a resume's content, consisting of typed sections and fields, produced by the Resume_Parser or created/edited by the User.
- **Original_Resume**: The Resume_Document produced directly from parsing the Resume_File, prior to AI enhancement.
- **Enhanced_Resume**: The Resume_Document produced by the AI_Enhancer after applying ATS-optimized improvements to the Original_Resume.
- **AI_Enhancer**: The component that transforms an Original_Resume into an Enhanced_Resume using an AI model, applying ATS best practices (keyword alignment, formatting, phrasing, quantified achievements).
- **ATS_Evaluator**: The component that analyzes a Resume_Document against a defined set of ATS Scoring_Criteria and produces an ATS_Score and Evaluation_Report.
- **Scoring_Criteria**: The defined set of rules used by the ATS_Evaluator to assess a Resume_Document (e.g., contact info completeness, section presence, keyword density, formatting compatibility, file structure compatibility).
- **ATS_Score**: A numeric value between 0 and 100, inclusive, representing how well a Resume_Document satisfies the Scoring_Criteria.
- **Evaluation_Report**: A structured breakdown of ATS_Score results, including per-criterion feedback and improvement suggestions.
- **Resume_Editor**: The in-app UI component that allows the User to view and modify the fields of a Resume_Document.
- **Resume_Repository**: The persistence layer (Supabase database) storing Resume_Document records, ATS_Score records, and Evaluation_Report records.
- **File_Storage**: The persistence layer (Supabase Storage) storing uploaded Resume_File binary content.
- **Auth_Service**: The Supabase-based authentication service that identifies and authorizes a User.
- **Supported_File_Type**: A file format accepted for upload, limited to PDF and DOCX.
- **Session**: An authenticated User's active interaction context, identified by the Auth_Service.

## Requirements

### Requirement 1: Resume File Upload

**User Story:** As a User, I want to upload my existing resume file, so that the system can extract and work with its content.

#### Acceptance Criteria

1. WHEN an authenticated User submits a file of a Supported_File_Type through the upload interface, THE System SHALL store the Resume_File in File_Storage and associate it with the User's account.
2. IF a User submits a file that is not a Supported_File_Type, THEN THE System SHALL reject the upload and display an error identifying the accepted file types.
3. IF a User submits a Resume_File exceeding the maximum allowed file size of 10 MB, THEN THE System SHALL reject the upload and display an error stating the size limit.
4. IF an unauthenticated visitor attempts to upload a Resume_File, THEN THE System SHALL reject the upload without storing any Resume_File and SHALL prompt the visitor to authenticate before the upload can be retried.
5. WHEN a Resume_File upload completes successfully, THE System SHALL trigger the Resume_Parser to process the uploaded file.
6. IF the System is unable to store a Resume_File in File_Storage due to a storage failure, THEN THE System SHALL notify the User that the upload failed, SHALL NOT associate an incomplete Resume_File with the User's account, and SHALL NOT trigger the Resume_Parser.

### Requirement 2: Resume Content Extraction (Parsing)

**User Story:** As a User, I want my uploaded resume converted into structured, editable content, so that I can review and adjust the information the system extracted.

#### Acceptance Criteria

1. WHEN the Resume_Parser processes a Resume_File of a Supported_File_Type that the Resume_Parser can successfully open, THE Resume_Parser SHALL produce an Original_Resume containing each of the identifiable sections (contact information, summary, work experience, education, skills) that is present in the Resume_File, and SHALL NOT include a section for which no corresponding content is present in the Resume_File.
2. IF the Resume_Parser cannot open a Resume_File or cannot extract any recognizable resume content from a Resume_File, THEN THE System SHALL notify the User that the file could not be parsed and SHALL allow the User to create a Resume_Document manually through the Resume_Editor.
3. WHEN an Original_Resume is produced, THE System SHALL persist the Original_Resume in the Resume_Repository, associated with the User and the source Resume_File.
4. FOR ALL Resume_Document instances, THE System SHALL serialize the Resume_Document to a storable representation and SHALL deserialize that representation into a Resume_Document containing identical section and field content, in the same section order, as the original Resume_Document (round-trip property).
5. THE System SHALL provide a Pretty_Printer that renders any Resume_Document as a resume layout in which all section headings and field content present in the Resume_Document are displayed, grouped under their corresponding section, with no section or field content omitted.

### Requirement 3: ATS Evaluation of Uploaded Resume

**User Story:** As a User, I want my uploaded resume scored against ATS criteria, so that I understand how well it currently performs.

#### Acceptance Criteria

1. WHEN an Original_Resume is produced from a Resume_File, THE System SHALL trigger the ATS_Evaluator to evaluate the Original_Resume against the Scoring_Criteria.
2. WHEN the ATS_Evaluator completes evaluation of a Resume_Document, THE ATS_Evaluator SHALL produce an ATS_Score that is an integer between 0 and 100, inclusive, and an Evaluation_Report.
3. FOR ALL Resume_Document instances, THE ATS_Evaluator SHALL produce an ATS_Score that is deterministic for identical Resume_Document content and identical Scoring_Criteria.
4. WHEN an Evaluation_Report is produced, THE Evaluation_Report SHALL include, for each evaluated Scoring_Criteria item, a pass/fail or partial status and an associated improvement suggestion when the item does not fully pass.
5. WHEN an ATS_Score and Evaluation_Report are produced for a Resume_Document, THE System SHALL persist the ATS_Score and Evaluation_Report in the Resume_Repository, associated with that Resume_Document, replacing any previously persisted ATS_Score and Evaluation_Report for that same Resume_Document.
6. WHEN evaluation of a Resume_Document completes, THE System SHALL display the resulting ATS_Score and Evaluation_Report to the User.
7. IF the ATS_Evaluator fails to complete evaluation of a Resume_Document due to an upstream error, THEN THE System SHALL notify the User that evaluation failed and SHALL retain any previously persisted ATS_Score and Evaluation_Report for that Resume_Document.
8. WHILE the ATS_Evaluator is evaluating a Resume_Document, THE System SHALL indicate to the User that evaluation is in progress.

### Requirement 4: AI-Powered Resume Enhancement

**User Story:** As a User, I want the AI to generate an ATS-optimized version of my resume, so that my chances of passing ATS screening and getting an interview improve.

#### Acceptance Criteria

1. WHEN a User requests enhancement of an Original_Resume, THE AI_Enhancer SHALL generate an Enhanced_Resume derived from that Original_Resume.
2. FOR ALL Enhanced_Resume instances, THE Enhanced_Resume SHALL preserve the factual identity fields (name and contact information) present in the source Original_Resume unchanged.
3. WHEN an Enhanced_Resume is generated, THE System SHALL persist the Enhanced_Resume in the Resume_Repository, associated with the User and the source Original_Resume.
4. WHEN an Enhanced_Resume is generated, THE System SHALL trigger the ATS_Evaluator to evaluate the Enhanced_Resume and produce an associated ATS_Score and Evaluation_Report.
5. IF the AI_Enhancer fails to generate an Enhanced_Resume because the AI model returns an error or does not complete generation within 60 seconds, THEN THE System SHALL notify the User of the failure.
6. IF the AI_Enhancer fails to generate an Enhanced_Resume, THEN THE System SHALL retain the unmodified Original_Resume.
7. WHEN both an Original_Resume and its corresponding Enhanced_Resume have ATS_Score values, THE System SHALL display both scores to the User for comparison.
8. WHEN a User requests enhancement of an Original_Resume that already has a corresponding Enhanced_Resume, THE System SHALL replace the existing Enhanced_Resume, its ATS_Score, and its Evaluation_Report with the newly generated ones.

### Requirement 5: Editing Resume Content

**User Story:** As a User, I want to edit both the originally extracted resume and the AI-enhanced resume, so that I can correct mistakes and personalize the final content.

#### Acceptance Criteria

1. WHEN a User modifies a field of an Original_Resume or an Enhanced_Resume through the Resume_Editor, THE System SHALL update the corresponding Resume_Document with the User's changes.
2. WHEN a User saves changes made in the Resume_Editor, THE System SHALL persist the updated Resume_Document to the Resume_Repository.
3. WHEN a Resume_Document's edits are successfully persisted to the Resume_Repository, THE System SHALL re-trigger the ATS_Evaluator to produce an updated ATS_Score and Evaluation_Report reflecting the edited content.
4. IF a User attempts to save a Resume_Document with the name field or all of the phone, email, and mailing address contact fields left empty, THEN THE System SHALL reject the save, SHALL display an error identifying the missing field, and SHALL retain the User's unsaved changes in the Resume_Editor.
5. THE Resume_Editor SHALL allow the User to switch between viewing/editing the Original_Resume and the Enhanced_Resume without losing unsaved changes to either.
6. WHEN a User edits a Resume_Document, THE System SHALL retain the previously saved version of that Resume_Document until the new version is successfully persisted.
7. IF the System fails to persist a User's edits to the Resume_Repository, THEN THE System SHALL notify the User that the save failed and SHALL retain the User's unsaved changes in the Resume_Editor.
8. IF the ATS_Evaluator fails to complete re-evaluation of an edited Resume_Document, THEN THE System SHALL notify the User that the updated score could not be generated and SHALL retain the previously displayed ATS_Score and Evaluation_Report.

### Requirement 6: Resume Data Access and Authorization

**User Story:** As a User, I want my resumes and evaluation results to be private and accessible only to me, so that my personal information stays protected.

#### Acceptance Criteria

1. THE Auth_Service SHALL require a valid Session before granting access to any Resume_File, Resume_Document, ATS_Score, or Evaluation_Report.
2. WHEN a User requests their own Resume_File, Resume_Document, ATS_Score, or Evaluation_Report, THE System SHALL return the requested resource.
3. IF a User requests a Resume_File, Resume_Document, ATS_Score, or Evaluation_Report owned by a different User, THEN THE System SHALL deny access and return an authorization error, including when the request is a deletion request.
4. WHEN a User explicitly requests deletion of a Resume_Document that they own, THE System SHALL remove the Resume_Document and its associated ATS_Score and Evaluation_Report from the Resume_Repository, and THE System SHALL NOT remove any Resume_Document through an automated or unattended cleanup process.
5. WHEN a User deletes a Resume_File that they own, THE System SHALL remove the Resume_File from File_Storage, and THE System SHALL NOT cascade that deletion to any associated Resume_Document, ATS_Score, or Evaluation_Report unless the User separately requests their deletion.
6. IF an unauthenticated visitor requests access to any Resume_File, Resume_Document, ATS_Score, or Evaluation_Report, THEN THE System SHALL deny access and require authentication.

### Requirement 7: Resume Export

**User Story:** As a User, I want to download my edited resume, so that I can submit it to job applications.

#### Acceptance Criteria

1. WHEN a User requests an export of a Resume_Document, THE System SHALL generate a downloadable file in PDF format, reflecting the current saved content of that Resume_Document, within 10 seconds.
2. FOR ALL Resume_Document instances, THE System SHALL produce an exported PDF containing all section content present in the Resume_Document at the time of export (round-trip content preservation between Resume_Document and exported file).
3. IF a User requests an export while unsaved changes exist in the Resume_Editor, THEN THE System SHALL prompt the User to either save the changes before exporting or cancel the export.
4. IF a User cancels the export from the save-or-cancel prompt, THEN THE System SHALL discard the export request and SHALL retain the User's unsaved changes in the Resume_Editor.
5. IF the System fails to generate the exported PDF, THEN THE System SHALL notify the User that the export failed and SHALL retain the current saved content of the Resume_Document unchanged.
