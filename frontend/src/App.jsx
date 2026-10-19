import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Guards & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AppShell from './layouts/AppShell';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import ResumeDetail from './pages/ResumeDetail';
import JobMatching from './pages/JobMatching';
import JobMatchHistory from './pages/JobMatchHistory';
import JobMatchDetail from './pages/JobMatchDetail';
import CareerGPS from './pages/CareerGPS';
import Applications from './pages/Applications';
import Settings from './pages/Settings';

// Phase 5 & 6A: Interview Prep Core, Analytics & Practice Modes
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewResults from './pages/InterviewResults';
import InterviewAnalytics from './pages/InterviewAnalytics';
import PracticeHub from './pages/practice/PracticeHub';
import FlashcardPractice from './pages/practice/FlashcardPractice';
import TimedPractice from './pages/practice/TimedPractice';
import CategoryPractice from './pages/practice/CategoryPractice';
import CompanyPractice from './pages/practice/CompanyPractice';
import CommunityPractice from './pages/practice/CommunityPractice';

// Builder Wizard Subroutes
import BuilderLayout from './pages/builder/BuilderLayout';
import Step1Template from './pages/builder/Step1Template';
import Step2Information from './pages/builder/Step2Information';
import Step3Suggestions from './pages/builder/Step3Suggestions';
import Step4LiveScore from './pages/builder/Step4LiveScore';
import Step5Preview from './pages/builder/Step5Preview';
import Step6Export from './pages/builder/Step6Export';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Phase 8: Admin Panel & Platform Management
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminInterviewCategories from './pages/admin/AdminInterviewCategories';
import AdminResumeTemplates from './pages/admin/AdminResumeTemplates';
import AdminJobCategories from './pages/admin/AdminJobCategories';
import AdminSkills from './pages/admin/AdminSkills';
import AdminReports from './pages/admin/AdminReports';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
          <Routes>
            {/* Public Home Landing Experience */}
            <Route path="/" element={<Home />} />

            {/* Public-Only Auth Routes (Redirects to /dashboard if logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected SaaS Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resumes" element={<Resumes />} />
                <Route path="/resumes/:id" element={<ResumeDetail />} />
                <Route path="/job-matching" element={<JobMatching />} />
                <Route path="/job-matching/history" element={<JobMatchHistory />} />
                <Route path="/job-matching/history/:id" element={<JobMatchDetail />} />
                
                {/* AI Interview Preparation Core Routes */}
                <Route path="/interview" element={<InterviewSetup />} />
                <Route path="/interview-prep" element={<Navigate to="/interview" replace />} />
                <Route path="/interview/session/:id" element={<InterviewSession />} />
                <Route path="/interview/results/:id" element={<InterviewResults />} />

                {/* Phase 6A: Analytics & Practice Modes */}
                <Route path="/interview/analytics" element={<InterviewAnalytics />} />
                <Route path="/interview/practice" element={<PracticeHub />} />
                <Route path="/interview/practice/flashcard" element={<FlashcardPractice />} />
                <Route path="/interview/practice/timed" element={<TimedPractice />} />
                <Route path="/interview/practice/category" element={<CategoryPractice />} />
                <Route path="/interview/practice/company" element={<CompanyPractice />} />
                <Route path="/interview/practice/community" element={<CommunityPractice />} />

                <Route path="/career-gps" element={<CareerGPS />} />
                <Route path="/applications" element={<Applications />} />
                
                {/* Multi-Step Resume Builder Wizard */}
                <Route path="/resume-builder" element={<BuilderLayout />}>
                  <Route index element={<Navigate to="/resume-builder/template" replace />} />
                  <Route path="template" element={<Step1Template />} />
                  <Route path="information" element={<Step2Information />} />
                  <Route path="suggestions" element={<Step3Suggestions />} />
                  <Route path="score" element={<Step4LiveScore />} />
                  <Route path="preview" element={<Step5Preview />} />
                  <Route path="export" element={<Step6Export />} />
                </Route>

                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Phase 8: Admin Panel (Protected by AdminLayout role guard) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="interview-categories" element={<AdminInterviewCategories />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="job-categories" element={<AdminJobCategories />} />
              <Route path="resume-templates" element={<AdminResumeTemplates />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
            </Route>

            {/* Catch-all 404 handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  </ThemeProvider>
);
}
