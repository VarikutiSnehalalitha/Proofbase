"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Clean existing data
    await prisma.analyticsEvent.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.sharePermission.deleteMany();
    await prisma.shareLink.deleteMany();
    await prisma.collectionProject.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.projectSkill.deleteMany();
    await prisma.externalLink.deleteMany();
    await prisma.projectFile.deleteMany();
    await prisma.project.deleteMany();
    await prisma.emailVerification.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    // Create demo users
    const passwordHash = await bcryptjs_1.default.hash('password123', 12);
    const alice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            passwordHash,
            username: 'alice',
            emailVerified: true,
        },
    });
    const bob = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            passwordHash,
            username: 'bob',
            emailVerified: true,
        },
    });
    const carol = await prisma.user.create({
        data: {
            email: 'carol@example.com',
            passwordHash,
            username: 'carol',
            emailVerified: true,
        },
    });
    // Create profiles
    await prisma.profile.create({
        data: {
            userId: alice.id,
            name: 'Alice Johnson',
            headline: 'Full Stack Developer & UI Designer',
            bio: 'Passionate developer with 5+ years of experience building web applications. I love creating beautiful, functional interfaces that solve real problems.',
            location: 'San Francisco, CA',
            website: 'https://alicejohnson.dev',
            githubUrl: 'https://github.com/alicejohnson',
            linkedinUrl: 'https://linkedin.com/in/alicejohnson',
            skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Figma', 'Tailwind CSS', 'GraphQL', 'Docker'],
            experience: '5 years in software development. Previously at Stripe, currently freelancing.',
            contactEmail: 'alice@example.com',
            isPublic: true,
        },
    });
    await prisma.profile.create({
        data: {
            userId: bob.id,
            name: 'Bob Martinez',
            headline: 'Data Scientist & ML Engineer',
            bio: 'Data scientist specializing in natural language processing and computer vision. I build ML models that drive business decisions.',
            location: 'Austin, TX',
            githubUrl: 'https://github.com/bobmartinez',
            linkedinUrl: 'https://linkedin.com/in/bobmartinez',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Scikit-learn', 'Pandas', 'AWS'],
            experience: '3 years in data science and machine learning.',
            contactEmail: 'bob@example.com',
            isPublic: true,
        },
    });
    await prisma.profile.create({
        data: {
            userId: carol.id,
            name: 'Carol Chen',
            headline: 'Product Designer & UX Researcher',
            bio: 'Product designer focused on creating intuitive user experiences through research-driven design.',
            location: 'New York, NY',
            website: 'https://carolchen.design',
            linkedinUrl: 'https://linkedin.com/in/carolchen',
            skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'HTML/CSS', 'Sketch', 'Adobe XD'],
            experience: '4 years in product design at tech startups.',
            contactEmail: 'carol@example.com',
            isPublic: true,
        },
    });
    // Create projects for Alice
    const project1 = await prisma.project.create({
        data: {
            userId: alice.id,
            name: 'E-Commerce Platform Redesign',
            description: 'Complete redesign of a legacy e-commerce platform serving 50K+ daily users. Modernized the tech stack from jQuery to React with TypeScript, implemented a new design system, and improved performance by 60%.',
            category: 'Web Development',
            role: 'Lead Frontend Developer',
            organization: 'ShopFlow Inc.',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-06-30'),
            responsibilities: 'Led a team of 4 developers. Architected the frontend, established coding standards, conducted code reviews, and mentored junior developers.',
            achievements: 'Reduced page load time by 60%. Increased conversion rate by 25%. Achieved 98% accessibility score.',
            outcomes: '50K+ daily active users migrated seamlessly. Revenue increased by 18% in the first quarter after launch.',
            status: 'published',
            visibility: 'public',
            isFeatured: true,
        },
    });
    await prisma.projectSkill.createMany({
        data: [
            { projectId: project1.id, name: 'React' },
            { projectId: project1.id, name: 'TypeScript' },
            { projectId: project1.id, name: 'Tailwind CSS' },
            { projectId: project1.id, name: 'Next.js' },
            { projectId: project1.id, name: 'PostgreSQL' },
        ],
    });
    await prisma.externalLink.createMany({
        data: [
            { projectId: project1.id, title: 'GitHub Repository', url: 'https://github.com/alicejohnson/shopflow-redesign', type: 'github' },
            { projectId: project1.id, title: 'Live Website', url: 'https://shopflow.example.com', type: 'website' },
            { projectId: project1.id, title: 'Design System (Figma)', url: 'https://figma.com/file/example', type: 'figma' },
        ],
    });
    const project2 = await prisma.project.create({
        data: {
            userId: alice.id,
            name: 'Task Management API',
            description: 'RESTful API for a task management application with real-time collaboration features using WebSockets.',
            category: 'Backend Development',
            role: 'Backend Developer',
            startDate: new Date('2024-07-01'),
            endDate: new Date('2024-09-15'),
            responsibilities: 'Designed and implemented the API, database schema, authentication system, and real-time features.',
            achievements: 'Handles 10K concurrent WebSocket connections. 99.9% uptime over 3 months.',
            outcomes: 'Used by 3 internal teams for project management.',
            status: 'published',
            visibility: 'public',
        },
    });
    await prisma.projectSkill.createMany({
        data: [
            { projectId: project2.id, name: 'Node.js' },
            { projectId: project2.id, name: 'Express' },
            { projectId: project2.id, name: 'PostgreSQL' },
            { projectId: project2.id, name: 'WebSockets' },
            { projectId: project2.id, name: 'Redis' },
        ],
    });
    const project3 = await prisma.project.create({
        data: {
            userId: alice.id,
            name: 'Personal Portfolio Website',
            description: 'My personal portfolio website built with Next.js and featuring smooth animations, dark mode, and blog integration.',
            category: 'Web Development',
            role: 'Solo Developer & Designer',
            startDate: new Date('2024-10-01'),
            status: 'draft',
            visibility: 'private',
        },
    });
    await prisma.projectSkill.createMany({
        data: [
            { projectId: project3.id, name: 'Next.js' },
            { projectId: project3.id, name: 'Framer Motion' },
            { projectId: project3.id, name: 'MDX' },
        ],
    });
    // Create projects for Bob
    const project4 = await prisma.project.create({
        data: {
            userId: bob.id,
            name: 'Customer Churn Prediction Model',
            description: 'Machine learning model to predict customer churn for a SaaS platform. Achieved 92% accuracy using gradient boosting with feature engineering.',
            category: 'Machine Learning',
            role: 'Data Scientist',
            organization: 'DataCorp Analytics',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-05-15'),
            responsibilities: 'Data collection, feature engineering, model training, hyperparameter tuning, deployment, and monitoring.',
            achievements: 'Model accuracy: 92%. Reduced churn by 15% in the first month. Saved $200K annually in customer retention costs.',
            outcomes: 'Deployed to production serving 100K+ predictions daily.',
            status: 'published',
            visibility: 'public',
            isFeatured: true,
        },
    });
    await prisma.projectSkill.createMany({
        data: [
            { projectId: project4.id, name: 'Python' },
            { projectId: project4.id, name: 'Scikit-learn' },
            { projectId: project4.id, name: 'Pandas' },
            { projectId: project4.id, name: 'XGBoost' },
            { projectId: project4.id, name: 'AWS SageMaker' },
        ],
    });
    await prisma.externalLink.createMany({
        data: [
            { projectId: project4.id, title: 'GitHub Repository', url: 'https://github.com/bobmartinez/churn-prediction', type: 'github' },
            { projectId: project4.id, title: 'Technical Blog Post', url: 'https://blog.example.com/churn-prediction', type: 'docs' },
        ],
    });
    // Create projects for Carol
    const project5 = await prisma.project.create({
        data: {
            userId: carol.id,
            name: 'HealthTrack App Redesign',
            description: 'Complete UX redesign of a health tracking mobile app. Conducted user research with 50+ participants and created a comprehensive design system.',
            category: 'UX Design',
            role: 'Lead Product Designer',
            organization: 'HealthTrack Inc.',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-07-30'),
            responsibilities: 'User research, persona creation, wireframing, prototyping, usability testing, and design system documentation.',
            achievements: 'Increased user retention by 40%. App store rating improved from 3.2 to 4.6. NPS score increased by 35 points.',
            outcomes: 'App redesign launched to 200K+ users with positive reception.',
            status: 'published',
            visibility: 'public',
            isFeatured: true,
        },
    });
    await prisma.projectSkill.createMany({
        data: [
            { projectId: project5.id, name: 'Figma' },
            { projectId: project5.id, name: 'User Research' },
            { projectId: project5.id, name: 'Prototyping' },
            { projectId: project5.id, name: 'Design Systems' },
            { projectId: project5.id, name: 'Usability Testing' },
        ],
    });
    await prisma.externalLink.createMany({
        data: [
            { projectId: project5.id, title: 'Figma Prototype', url: 'https://figma.com/proto/example', type: 'figma' },
            { projectId: project5.id, title: 'Case Study', url: 'https://carolchen.design/healthtrack', type: 'website' },
        ],
    });
    // Create collections
    const collection1 = await prisma.collection.create({
        data: {
            userId: alice.id,
            name: 'Frontend Projects',
            description: 'My collection of frontend development projects',
        },
    });
    await prisma.collectionProject.create({
        data: { collectionId: collection1.id, projectId: project1.id },
    });
    // Create some activity logs
    await prisma.activityLog.createMany({
        data: [
            { userId: alice.id, action: 'created', entityType: 'project', entityId: project1.id },
            { userId: alice.id, action: 'published', entityType: 'project', entityId: project1.id },
            { userId: alice.id, action: 'created', entityType: 'project', entityId: project2.id },
            { userId: alice.id, action: 'published', entityType: 'project', entityId: project2.id },
            { userId: bob.id, action: 'created', entityType: 'project', entityId: project4.id },
            { userId: bob.id, action: 'published', entityType: 'project', entityId: project4.id },
            { userId: carol.id, action: 'created', entityType: 'project', entityId: project5.id },
            { userId: carol.id, action: 'published', entityType: 'project', entityId: project5.id },
        ],
    });
    // Create some analytics events
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        // Profile views
        await prisma.analyticsEvent.create({
            data: {
                type: 'profile_view',
                targetType: 'profile',
                targetId: alice.id,
                userId: alice.id,
                visitorId: `visitor-${Math.floor(Math.random() * 20)}`,
                createdAt: date,
            },
        });
        // Project views
        if (i % 2 === 0) {
            await prisma.analyticsEvent.create({
                data: {
                    type: 'project_view',
                    targetType: 'project',
                    targetId: project1.id,
                    userId: alice.id,
                    visitorId: `visitor-${Math.floor(Math.random() * 15)}`,
                    createdAt: date,
                },
            });
        }
    }
    console.log('✅ Seed complete!');
    console.log('');
    console.log('Demo accounts:');
    console.log('  alice@example.com / password123 (Full Stack Developer)');
    console.log('  bob@example.com   / password123 (Data Scientist)');
    console.log('  carol@example.com / password123 (Product Designer)');
    console.log('');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map