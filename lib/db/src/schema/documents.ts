import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const documentRecordsTable = pgTable("document_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  title: text("title").notNull(),
  documentType: text("document_type"),
  linkedRecordType: text("linked_record_type"),
  linkedRecordId: integer("linked_record_id"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: text("uploaded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const objectStorageRefsTable = pgTable("object_storage_refs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  documentId: integer("document_id").references(() => documentRecordsTable.id),
  storageKey: text("storage_key").notNull(),
  bucket: text("bucket").notNull(),
  originalFilename: text("original_filename"),
  contentType: text("content_type"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
