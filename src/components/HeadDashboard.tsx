import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Exam, ClassSchedule, ExamBlockSchedule, Update, Module } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

interface HeadDashboardProps {
  onLogout?: () => void;
}

const HeadDashboard: React.FC<HeadDashboardProps> = ({ onLogout }) => {
  const { currentUser, logout } = useAuth();
  
  // State for different entities
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'Computer Science Fundamentals Final',
      description: 'Comprehensive exam covering all course topics',
      date: new Date('2024-12-15T09:00:00'),
      duration: 120,
      courseId: 'CS101'
    },
    {
      id: '2',
      title: 'Mathematics II Midterm',
      description: 'Covers chapters 1-5',
      date: new Date('2024-11-20T14:00:00'),
      duration: 90,
      courseId: 'MATH201'
    }
  ]);

  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([
    {
      id: '1',
      courseId: 'CS101',
      day: 'Monday',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 301'
    },
    {
      id: '2',
      courseId: 'CS101',
      day: 'Wednesday',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 301'
    }
  ]);

  const [examBlocks, setExamBlocks] = useState<ExamBlockSchedule[]>([
    {
      id: '1',
      title: 'Final Exam Period',
      description: 'End of semester examinations',
      startDate: new Date('2024-12-10'),
      endDate: new Date('2024-12-20'),
      courseId: 'ALL'
    }
  ]);

  const [updates, setUpdates] = useState<Update[]>([
    {
      id: '1',
      title: 'Assignment Deadline Extended',
      content: 'The deadline for Project 2 has been extended to Friday at 11:59 PM.',
      postedBy: 'Prof. Sarah Johnson',
      postedAt: new Date('2024-11-10T10:30:00'),
      category: 'general'
    },
    {
      id: '2',
      title: 'Extra Tutorial Session',
      content: 'Additional tutorial session this Thursday at 2 PM in Room 205.',
      postedBy: 'Dr. Elias Kemal',
      postedAt: new Date('2024-11-09T14:00:00'),
      category: 'exam'
    }
  ]);

  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction to Computer Science',
      description: 'Basic concepts and fundamentals',
      content: 'This module covers the basics of computer science including algorithms, data structures, and programming concepts.',
      category: 'Computer Science',
      order: 1,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-01'),
      voiceEnabled: true
    },
    {
      id: '2',
      title: 'Advanced Mathematics',
      description: 'Calculus and linear algebra',
      content: 'Advanced mathematical concepts including calculus, linear algebra, and differential equations.',
      category: 'Mathematics',
      order: 2,
      isActive: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-10-15'),
      voiceEnabled: true
    }
  ]);

  const [activeSection, setActiveSection] = useState<'overview' | 'exams' | 'schedule' | 'exam-blocks' | 'updates' | 'modules'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Chart data for overview
  const chartData = [
    { name: 'Exams', value: exams.length, color: '#3B82F6' },
    { name: 'Schedules', value: classSchedules.length, color: '#10B981' },
    { name: 'Blocks', value: examBlocks.length, color: '#F59E0B' },
    { name: 'Updates', value: updates.length, color: '#EF4444' },
    { name: 'Modules', value: modules.length, color: '#8B5CF6' }
  ];

  const monthlyData = [
    { month: 'Jan', exams: 2, schedules: 4, updates: 3 },
    { month: 'Feb', exams: 1, schedules: 3, updates: 2 },
    { month: 'Mar', exams: 3, schedules: 5, updates: 4 },
    { month: 'Apr', exams: 2, schedules: 4, updates: 3 },
    { month: 'May', exams: 4, schedules: 6, updates: 5 },
    { month: 'Jun', exams: 2, schedules: 4, updates: 3 }
  ];

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    courseId: '',
    day: '',
    location: '',
    startDate: '',
    endDate: '',
    content: '',
    category: 'general' as 'general' | 'exam' | 'module'
  });

  // Add notification helper
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  // Loading simulation for demo
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleAddExam = () => {
    simulateLoading();
    const newExam: Exam = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      duration: parseInt(formData.duration),
      courseId: formData.courseId
    };
    setExams([...exams, newExam]);
    addNotification(`Exam "${formData.title}" added successfully!`);
    resetForm();
  };

  const handleAddSchedule = () => {
    simulateLoading();
    const newSchedule: ClassSchedule = {
      id: Date.now().toString(),
      courseId: formData.courseId,
      day: formData.day,
      time: formData.time,
      location: formData.location
    };
    setClassSchedules([...classSchedules, newSchedule]);
    addNotification(`Schedule for ${formData.courseId} added successfully!`);
    resetForm();
  };

  const handleAddExamBlock = () => {
    simulateLoading();
    const newBlock: ExamBlockSchedule = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      courseId: formData.courseId
    };
    setExamBlocks([...examBlocks, newBlock]);
    addNotification(`Exam block "${formData.title}" added successfully!`);
    resetForm();
  };

  const handleAddModule = () => {
    simulateLoading();
    const newModule: Module = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      content: formData.content,
      category: formData.category,
      order: modules.length + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      voiceEnabled: true
    };
    setModules([...modules, newModule]);
    addNotification(`Module "${formData.title}" added successfully!`);
    resetForm();
  };

  const handleAddUpdate = () => {
    simulateLoading();
    const newUpdate: Update = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      postedBy: currentUser?.name || 'Head of Department',
      postedAt: new Date(),
      category: formData.category
    };
    setUpdates([...updates, newUpdate]);
    addNotification(`Update "${formData.title}" posted successfully!`);
    resetForm();
  };

  const handleDelete = (id: string, type: 'exam' | 'schedule' | 'block' | 'update' | 'module') => {
    switch (type) {
      case 'exam':
        setExams(exams.filter(e => e.id !== id));
        break;
      case 'schedule':
        setClassSchedules(classSchedules.filter(s => s.id !== id));
        break;
      case 'block':
        setExamBlocks(examBlocks.filter(b => b.id !== id));
        break;
      case 'update':
        setUpdates(updates.filter(u => u.id !== id));
        break;
      case 'module':
        setModules(modules.filter(m => m.id !== id));
        break;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '',
      courseId: '',
      day: '',
      location: '',
      startDate: '',
      endDate: '',
      content: '',
      category: 'general'
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome back, Head {currentUser?.name}!</h2>
        <p className="text-gray-600 mb-4">Here's what's happening in your department today</p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
            <CheckCircleIcon className="w-5 h-5" />
            <span>All systems operational</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
            <InformationCircleIcon className="w-5 h-5" />
            <span>{updates.length} active updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: CalendarDaysIcon, title: 'Total Exams', value: exams.length, bgColor: 'from-blue-500 to-blue-600', trend: '+12%' },
          { icon: ClockIcon, title: 'Class Schedules', value: classSchedules.length, bgColor: 'from-green-500 to-green-600', trend: '+8%' },
          { icon: BellIcon, title: 'Exam Blocks', value: examBlocks.length, bgColor: 'from-yellow-500 to-yellow-600', trend: '+15%' },
          { icon: UserGroupIcon, title: 'Updates Posted', value: updates.length, bgColor: 'from-purple-500 to-purple-600', trend: '+5%' }
        ].map((stat, index) => (
          <div key={stat.title} className="glass-card p-6 text-center">
            <div className={`p-4 bg-gradient-to-r ${stat.bgColor} rounded-2xl mx-auto mb-4 w-fit`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 mb-2">{stat.title}</p>
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {stat.trend} this month
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-primary-50 to-secondary-50'
    }`}>
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{notification}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <header className={`${
        isDarkMode 
          ? 'bg-gray-800/90 backdrop-blur-xl shadow-lg border-b border-gray-700' 
          : 'bg-white/90 backdrop-blur-xl shadow-lg border-b'
        } sticky top-0 z-40`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Head of Department Dashboard</h1>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {currentUser?.name} • Head of Department • {currentUser?.department}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={handleLogout}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${
        isDarkMode 
          ? 'bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-700' 
          : 'bg-white/80 backdrop-blur-lg shadow-sm border-b'
        } sticky top-16 z-30`}
      >
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'exams', label: 'Exams', icon: CalendarDaysIcon },
              { key: 'schedule', label: 'Schedule', icon: ClockIcon },
              { key: 'exam-blocks', label: 'Exam Blocks', icon: BellIcon },
              { key: 'updates', label: 'Updates', icon: ArrowPathIcon },
              { key: 'modules', label: 'Modules', icon: BookOpenIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`nav-tab flex items-center space-x-3 px-6 py-4 border-b-4 transition-all duration-300 whitespace-nowrap ${
                  activeSection === tab.key 
                    ? `border-primary-600 ${
                        isDarkMode 
                          ? 'text-primary-400 bg-primary-900/20' 
                          : 'text-primary-600 bg-gradient-to-r from-primary-50 to-transparent'
                      }` 
                    : `border-transparent ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeSection === 'overview' && renderOverview()}
        {/* Add other sections content here as needed */}
      </main>
    </div>
  );
};

export default HeadDashboard;
