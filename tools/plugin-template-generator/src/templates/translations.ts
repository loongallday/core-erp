/**
 * Core ERP Plugin Template Generator - Translation Templates
 * 
 * This module contains templates for i18n translation files.
 * Translations support multi-language interfaces and follow i18next format.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates English translations (src/translations/en.json)
 * 
 * Creates comprehensive translations for:
 * - Page titles and subtitles
 * - Field labels and descriptions
 * - Actions and buttons
 * - Success/error messages
 * - Empty states
 * 
 * @param ctx - Template context
 * @returns English translations JSON
 */
export function enTranslationsTemplate(ctx: TemplateContext): string {
  const translations = {
    // Page titles
    [ctx.resourceNameLowerPlural]: {
      title: ctx.pluginName,
      subtitle: `Manage ${ctx.resourceNameLowerPlural} and their details`,
      
      // Actions
      create: `Add ${ctx.resourceName}`,
      edit: `Edit ${ctx.resourceName}`,
      delete: `Delete ${ctx.resourceName}`,
      view: `View ${ctx.resourceName}`,
      
      // Form labels
      create_subtitle: `Create a new ${ctx.resourceNameLower}`,
      edit_subtitle: `Update ${ctx.resourceNameLower} information`,
      detail_subtitle: `${ctx.resourceName} details and information`,
      
      // Field labels
      fields: {
        name: 'Name',
        name_placeholder: `Enter ${ctx.resourceNameLower} name`,
        name_description: `The name of the ${ctx.resourceNameLower} (2-100 characters)`,
        description: 'Description',
        description_placeholder: `Enter ${ctx.resourceNameLower} description`,
        description_description: `Optional description of the ${ctx.resourceNameLower} (max 500 characters)`,
      },
      
      // Messages
      created: `${ctx.resourceName} created successfully`,
      updated: `${ctx.resourceName} updated successfully`,
      deleted: `${ctx.resourceName} deleted successfully`,
      
      // Empty states
      empty: `No ${ctx.resourceNameLowerPlural} found`,
      create_first: `Create your first ${ctx.resourceNameLower}`,
      not_found: `${ctx.resourceName} not found`,
      
      // Confirmations
      delete_confirm_title: `Delete ${ctx.resourceName}?`,
      delete_confirm_message: `This action cannot be undone. The ${ctx.resourceNameLower} will be permanently deleted.`,
      
      // Details
      details: `${ctx.resourceName} Details`,
      details_subtitle: `View ${ctx.resourceNameLower} information`,
    },
    
    // Widget (if applicable)
    widget: {
      title: ctx.pluginName,
      description: `${ctx.resourceName} statistics`,
      total_items: `Total ${ctx.resourceNameLowerPlural}`,
      view_all: `View All ${ctx.resourceNamePlural}`,
    },
    
    // Common terms
    common: {
      search: 'Search...',
      filter: 'Filter',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      deleting: 'Deleting...',
      back: 'Back',
      created_at: 'Created At',
      updated_at: 'Updated At',
      loading: 'Loading...',
    },
    
    // Error messages
    errors: {
      fetch_failed: 'Failed to load data. Please try again.',
      save_failed: 'Failed to save. {{message}}',
      delete_failed: 'Failed to delete. {{message}}',
      unknown: 'An unknown error occurred',
    },
  }
  
  return JSON.stringify(translations, null, 2)
}

/**
 * Generates Thai translations (src/translations/th.json)
 * 
 * Creates Thai translations matching the English structure.
 * 
 * @param ctx - Template context
 * @returns Thai translations JSON
 */
export function thTranslationsTemplate(ctx: TemplateContext): string {
  const translations = {
    // Page titles
    [ctx.resourceNameLowerPlural]: {
      title: ctx.pluginName,
      subtitle: `จัดการ${ctx.resourceNameLowerPlural}และรายละเอียด`,
      
      // Actions
      create: `เพิ่ม${ctx.resourceName}`,
      edit: `แก้ไข${ctx.resourceName}`,
      delete: `ลบ${ctx.resourceName}`,
      view: `ดู${ctx.resourceName}`,
      
      // Form labels
      create_subtitle: `สร้าง${ctx.resourceNameLower}ใหม่`,
      edit_subtitle: `อัปเดตข้อมูล${ctx.resourceNameLower}`,
      detail_subtitle: `รายละเอียดและข้อมูล${ctx.resourceName}`,
      
      // Field labels
      fields: {
        name: 'ชื่อ',
        name_placeholder: `ป้อนชื่อ${ctx.resourceNameLower}`,
        name_description: `ชื่อของ${ctx.resourceNameLower} (2-100 ตัวอักษร)`,
        description: 'คำอธิบาย',
        description_placeholder: `ป้อนคำอธิบาย${ctx.resourceNameLower}`,
        description_description: `คำอธิบายเพิ่มเติมของ${ctx.resourceNameLower} (สูงสุด 500 ตัวอักษร)`,
      },
      
      // Messages
      created: `สร้าง${ctx.resourceName}สำเร็จ`,
      updated: `อัปเดต${ctx.resourceName}สำเร็จ`,
      deleted: `ลบ${ctx.resourceName}สำเร็จ`,
      
      // Empty states
      empty: `ไม่พบ${ctx.resourceNameLowerPlural}`,
      create_first: `สร้าง${ctx.resourceNameLower}แรกของคุณ`,
      not_found: `ไม่พบ${ctx.resourceName}`,
      
      // Confirmations
      delete_confirm_title: `ลบ${ctx.resourceName}หรือไม่?`,
      delete_confirm_message: `การดำเนินการนี้ไม่สามารถยกเลิกได้ ${ctx.resourceNameLower}จะถูกลบอย่างถาวร`,
      
      // Details
      details: `รายละเอียด${ctx.resourceName}`,
      details_subtitle: `ดูข้อมูล${ctx.resourceNameLower}`,
    },
    
    // Widget
    widget: {
      title: ctx.pluginName,
      description: `สถิติ${ctx.resourceName}`,
      total_items: `${ctx.resourceNameLowerPlural}ทั้งหมด`,
      view_all: `ดูทั้งหมด${ctx.resourceNamePlural}`,
    },
    
    // Common terms
    common: {
      search: 'ค้นหา...',
      filter: 'กรอง',
      actions: 'การดำเนินการ',
      view: 'ดู',
      edit: 'แก้ไข',
      delete: 'ลบ',
      cancel: 'ยกเลิก',
      save: 'บันทึก',
      saving: 'กำลังบันทึก...',
      deleting: 'กำลังลบ...',
      back: 'กลับ',
      created_at: 'สร้างเมื่อ',
      updated_at: 'อัปเดตเมื่อ',
      loading: 'กำลังโหลด...',
    },
    
    // Error messages
    errors: {
      fetch_failed: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง',
      save_failed: 'ไม่สามารถบันทึกได้ {{message}}',
      delete_failed: 'ไม่สามารถลบได้ {{message}}',
      unknown: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    },
  }
  
  return JSON.stringify(translations, null, 2)
}

