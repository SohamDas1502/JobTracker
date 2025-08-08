# JobStash - Your Personal Job Application Manager

> A modern, full-stack web application to streamline your job search journey. Track applications, manage deadlines, analyze your progress, and never miss a follow-up again.

## Why JobStash?

Job hunting can be overwhelming. Between multiple applications, different stages, follow-up reminders, and keeping track of deadlines, it's easy to lose control. **JobStash** solves this by providing a centralized, intuitive platform to manage your entire job search process.

## Key Features

### **Smart Dashboard**
- Get an instant overview of your job search progress
- Track applications by status with beautiful visual charts
- Monitor upcoming deadlines and reminders
- View recent application activity at a glance

### **Application Management**
- **Add New Applications**: Comprehensive form with company details, position info, and contact information
- **Status Tracking**: Follow applications through 8 different stages (Applied → Offer)
- **Priority Levels**: Mark applications as Low, Medium, or High priority
- **Smart Follow-ups**: Automated reminder calculations based on deadlines and preferences

### **Analytics & Insights**
- **Application Timeline**: Visual charts showing your activity over time
- **Status Distribution**: Pie charts breaking down applications by current status
- **Success Rates**: Track your interview-to-offer conversion rates
- **Monthly Trends**: Analyze application patterns and optimize your strategy

### **Personalized Settings**
- **Default Preferences**: Set your preferred application status and follow-up timing
- **Smart Reminders**: Automatic follow-up scheduling with intelligent deadline detection
- **Theme Customization**: Switch between light and dark modes
- **Data Export**: Download all your application data as CSV for external analysis

### **Secure Account Management**
- **Email Authentication**: Secure login with NextAuth.js
- **Password Reset**: Forgot password functionality with email verification
- **Profile Management**: Update personal information and preferences
- **Data Privacy**: Your information is secure and private

## Technical Stack

**Frontend:**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **Recharts** - Beautiful, interactive charts
- **Heroicons** - Consistent iconography

**Backend:**
- **Next.js API Routes** - Serverless backend functions
- **Prisma ORM** - Type-safe database operations
- **SQLite** - Lightweight, reliable database
- **NextAuth.js** - Authentication and session management

**Features:**
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode** - Comfortable viewing in any environment
- **Form Validation** - Zod schema validation with React Hook Form
- **Email System** - Password reset functionality with Nodemailer

## User Experience

JobStash is designed with simplicity and efficiency in mind:

- **Intuitive Navigation**: Clean sidebar with clear sections
- **Smart Forms**: Auto-filled defaults based on your preferences
- **Visual Feedback**: Progress indicators, loading states, and success messages
- **Responsive Design**: Seamless experience across all devices
- **Accessibility**: Keyboard navigation and screen reader friendly

## Pages & Functionality

### **Dashboard** (`/dashboard`)
Your command center with stats, recent activity, and upcoming reminders.

### **Applications** (`/applications`)
- View all applications in a sortable, filterable table
- Quick status updates and priority management
- Detailed application pages with full information

### **Add Application** (`/applications/new`)
Comprehensive form with:
- Company and position details
- Job type and work location
- Application dates and deadlines
- Contact information
- Notes and requirements

### **Analytics** (`/analytics`)
Visual insights into your job search:
- Application timeline charts
- Status distribution graphs
- Success rate metrics
- Export capabilities

### **Settings** (`/settings`)
Customize your experience:
- Application tracking preferences
- Default status and follow-up timing
- Theme selection
- Data management

### **Profile** (`/profile`)
Manage your account:
- Personal information
- Password management
- Data export functionality
- Account security

## � Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SohamDas1502/JobStash.git
   cd JobStash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Environment Configuration

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (for password reset)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"
FROM_EMAIL="noreply@yourapp.com"
```

## About the Developer

Developed by **Soham Das** - A passionate full-stack developer who understands the challenges of job hunting and wanted to create a solution that actually helps.

**Connect with me:**
- GitHub: [@SohamDas1502](https://github.com/SohamDas1502)
- Email: sohammunmun@gmail.com

---
