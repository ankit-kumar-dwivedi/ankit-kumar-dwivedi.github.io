const startYear = 2020;
const experienceYears = new Date().getFullYear() - startYear;

const PORTFOLIO_DATA = {
  about: {
    name: "Ankit Dwivedi",
    title: "Senior Software Engineer",
    headline: `Senior Software Engineer with ${experienceYears}+ years of experience building large-scale backend systems`,
    subheading: "Specializing in building high-quality backend architectures, currently focused on developing innovative solutions at Agoda.",
    tagline: "Let's build something amazing together!",
    resumeUrl: "https://www.linkedin.com/in/ankit-dwivedi/"
  },
  experience: [
    {
      id: "agoda",
      company: "Agoda",
      role: "Senior Software Engineer",
      period: "Sep 2024 – Present",
      location: "Gurugram, India",
      description: "Working on core features and architectural improvements for global scale booking systems.",
      achievements: [
        "AI Innovation: Developed an AI-based Bot using GPT and MCP for automated L1 triage and ops support being used org-wide, significantly reducing manual developer intervention.",
        "Large Partner Migration: Led the end-to-end migration of 1M+ accounts for Rocketmiles (Agoda’s largest partner) from legacy systems to the Agoda stack with zero downtime.",
        "System Design: Designed earn-and-burn promo flows using rule engines and near real-time rule validation",
        "Own the end-to-end points system (economics, accrual, consistency); serving 5K+ pricing and 4K+ offer RPM with sub-100ms latency."
      ]
    },
    {
      id: "stripe",
      company: "Stripe",
      role: "Software Engineer",
      period: "Feb 2024 – Jul 2024",
      location: "Dublin, Ireland",
      description: "Improved webhook durability by implementing in-band generation, significantly enhancing reliability and timeliness while reducing failure rates. Refactored Stripe's Internal API DSL to untangle code and optimize efficiency.",
      achievements: [
        "Designed and implemented in-band generation for stripe webhooks, improving durability and ensuring zero event drops.",
        "Refactored stripe's internal API DSL code, untangling legacy interdependencies and enhancing developer velocity."
      ]
    },
    {
      id: "google",
      company: "Google",
      role: "Software Engineer 2",
      period: "Jun 2022 – Feb 2024",
      location: "Bangalore, India",
      description: "Worked on 'Crush' within the Ads Billing Monetizer team, providing unified granular data for revenue, billing, and usage across Google Ads products. Scaled data processing using FlumeJava from 6 million to 30 billion rows per month. On the Geo Moderation team, implemented road geometry-related user-generated content features using C++.",
      achievements: [
        "Scaled FlumeJava Ads billing pipeline from 6M rows to 30B rows/month, processing massive usage and pricing data points.",
        "Implemented C++ real-time validation checks for road geometry-related UGC inside Google Maps, reducing malicious edits."
      ]
    },
    {
      id: "hotstar",
      company: "Disney+ Hotstar",
      role: "Software Development Engineer 1",
      period: "Aug 2021 – May 2022",
      location: "Bangalore, India",
      description: "Built robust, secure, and scalable backend microservices for Hotstar OTT services. Collaborated with the product team on the 'Hotstar X' project to implement show and episode enhancements and deliver new user experiences.",
      achievements: [
        "Engineered scalable backend microservices for the global 'Hotstar X' migration, supporting millions of concurrent streaming clients.",
        "Created optimized show detail and playback metadata aggregation APIs to decrease cold-start app latency by 15%."
      ]
    },
    {
      id: "wheelseye",
      company: "Wheelseye Technology",
      role: "Software Development Engineer 1",
      period: "Jan 2020 – Jul 2021",
      location: "Gurugram, India",
      description: "Developed microservice architectures on the Fastag team. Designed an automated system to detect incorrect toll deductions and implemented a near real-time auto-recharge mechanism.",
      achievements: [
        "Designed toll discrepancy detection algorithms, saving transporters thousands in incorrect NHAI deductions.",
        "Built near real-time automatic wallet recharge queue workers via Kafka, achieving sub-second recharge latency."
      ]
    }
  ],
  skills: {
    languages: ["Java", "Python", "C++", "Scala", "gRPC", "JavaScript"],
    databases: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch"],
    infrastructure: ["Kafka", "Git", "GitHub", "Docker", "AWS"]
  },
  projects: [
    {
      title: "Salvador - Space Adventure",
      description: "A 2D space action-adventure game where players fight alien creatures and collect keys to save the planet.",
      link: "https://oxcafebabe.itch.io/salvador",
      tags: ["Game Development", "HTML5", "Canvas", "Physics"],
      icon: "🎮"
    },
    {
      title: "Algorithm Visualizer",
      description: "A full-stack application that helps users learn complex algorithms through step-by-step interactive visual animations.",
      link: "https://github.com/ankit-kumar-dwivedi/Algorithm-Visualizer",
      tags: ["Java", "JavaScript", "PostgreSQL", "Visualization"],
      icon: "📊"
    },
    {
      title: "Vectorization of Bitmaps",
      description: "Google Summer of Code 2019 project implementing raster image vectorization for Synfig Studio using OpenToonz algorithms.",
      link: "https://summerofcode.withgoogle.com/archive/2019/projects/6474348691456000",
      tags: ["C++", "Image Processing", "GSoC", "Synfig Studio"],
      icon: "🖼️"
    },
    {
      title: "Delivery Allocation System",
      description: "A backend resource assignment system designed to automatically allocate delivery partners to customer orders. Built with Spring Boot.",
      link: "https://github.com/ankit-kumar-dwivedi/GrofersDeliveryAssignment",
      tags: ["Spring Boot", "H2 Database", "Algorithms", "Backend"],
      icon: "🚚"
    },
    {
      title: "Smart Kaksha",
      description: "An educational platform designed to improve classroom interactions and attendance systems between teachers and students.",
      link: "https://github.com/ankit-kumar-dwivedi/smartKaksha",
      tags: ["Android", "Firebase", "Realtime DB"],
      icon: "🏫"
    },
    {
      title: "Actor Quiz",
      description: "A React game test application designed to challenge users' knowledge about actors and movies.",
      link: "https://github.com/ankit-kumar-dwivedi/ActorQuiz",
      tags: ["React", "CSS3", "API Integration"],
      icon: "🎭"
    }
  ],
  blogs: [
    {
      title: "The Simplified Introduction of Vector Databases",
      date: "Feb 29, 2024",
      link: "https://medium.com/@dwivedi.ankit21/the-simplified-introduction-of-vector-databases-d1d9c22ea828"
    },
    {
      title: "gRPC Explained: Part 2 Protobuf",
      date: "Oct 8, 2023",
      link: "https://medium.com/@dwivedi.ankit21/grpc-explained-part-2-protobuf-19d3d7f26cfa"
    },
    {
      title: "gRPC Explained: Part 1 Introduction",
      date: "Sep 24, 2023",
      link: "https://medium.com/@dwivedi.ankit21/grpc-explained-part-1-introduction-6582dc4c7977"
    },
    {
      title: "The Debugger: A Behind-the-Scenes Look at How It Works",
      date: "Sep 2, 2023",
      link: "https://medium.com/@dwivedi.ankit21/the-debugger-a-behind-the-scenes-look-at-how-it-works-983a65883e97"
    },
    {
      title: "Scaling to New Heights: Shopify's Flash Sales Architecture",
      date: "May 20, 2023",
      link: "https://medium.com/@dwivedi.ankit21/scaling-to-new-heights-shopifys-journey-of-handling-massive-flash-sales-and-architectural-de2e4f0baede"
    },
    {
      title: "Rate Limiting and Load Shedding in Distributed Systems",
      date: "May 14, 2023",
      link: "https://medium.com/@dwivedi.ankit21/rate-limiting-and-load-shedding-keeping-distributed-systems-stable-and-responsive-6c5ae2215a5"
    }
  ],
  social: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/ankit-dwivedi/", icon: "linkedin" },
    { name: "GitHub", url: "https://github.com/ankit-kumar-dwivedi", icon: "github" },
    { name: "Medium", url: "https://medium.com/@dwivedi.ankit21", icon: "medium" },
    { name: "Instagram", url: "http://instagram.com/ankit._.dwivedi", icon: "instagram" }
  ]
};
