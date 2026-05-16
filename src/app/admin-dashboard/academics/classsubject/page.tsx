// src/app/admin-dashboard/academics/classsubject/page.tsx
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { BookOpen, GraduationCap, ChevronRight, LayoutDashboard } from 'lucide-react'

export default function ClassSubjectHubPage() {
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" /> Classes & Subjects
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your school's structural foundation. Create the global syllabus or organize student classrooms.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Subjects Card */}
          <Link href="/admin-dashboard/academics/classsubject/subjects" className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">Subject Master</h3>
            <p className="text-sm text-slate-500 flex-1 mb-6">
              Define the global catalog of subjects for the academic year. Configure Core, Elective, and Optional subjects, along with their grading rules and practicals.
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
              Manage Subjects <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Classes Card */}
          <Link href="/admin-dashboard/academics/classsubject/classes" className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all flex flex-col h-full">
            <div className="w-14 h-14 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">Class Manager</h3>
            <p className="text-sm text-slate-500 flex-1 mb-6">
              Create and manage classrooms. Define capacities, add sections (e.g., 10-A, 10-B), set application fees, and assign Class Teachers.
            </p>
            <div className="flex items-center text-sm font-bold text-violet-600 group-hover:gap-2 transition-all">
              Manage Classes <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

        </div>
      </div>
    </AdminLayout>
  )
}