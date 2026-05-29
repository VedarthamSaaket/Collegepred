import { PrismaClient, CollegeType, ExamType, Category } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

const collegesData = [
  {
    name: 'Indian Institute of Technology Madras',
    slug: 'iit-madras',
    location: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: CollegeType.IIT,
    rating: 4.8,
    totalFees: 250000,
    overview: 'IIT Madras is a premier institute of national importance established in 1959. It is consistently ranked among the top engineering institutes in India with world-class research facilities and a vibrant campus life.',
    established: 1959,
    website: 'https://www.iitm.ac.in',
    naacGrade: 'A++',
    nirfRank: 1,
    placementAvg: 2500000,
    placementMax: 67000000,
    placementPct: 95,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'Indian Institute of Technology Delhi',
    slug: 'iit-delhi',
    location: 'New Delhi, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: CollegeType.IIT,
    rating: 4.8,
    totalFees: 250000,
    overview: 'IIT Delhi was established in 1961 and has grown into one of the most prestigious engineering institutions in India. The institute offers undergraduate and postgraduate programs across engineering, science, and management.',
    established: 1961,
    website: 'https://www.iitd.ac.in',
    naacGrade: 'A++',
    nirfRank: 2,
    placementAvg: 2400000,
    placementMax: 62000000,
    placementPct: 94,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'McKinsey', 'Qualcomm'],
  },
  {
    name: 'Indian Institute of Technology Bombay',
    slug: 'iit-bombay',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: CollegeType.IIT,
    rating: 4.8,
    totalFees: 250000,
    overview: 'IIT Bombay was established in 1958 and is recognized globally for its excellence in engineering education and research. The campus is located in Powai with state-of-the-art infrastructure.',
    established: 1958,
    website: 'https://www.iitb.ac.in',
    naacGrade: 'A++',
    nirfRank: 3,
    placementAvg: 2400000,
    placementMax: 58000000,
    placementPct: 94,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Apple'],
  },
  {
    name: 'Indian Institute of Technology Kanpur',
    slug: 'iit-kanpur',
    location: 'Kanpur, Uttar Pradesh',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: CollegeType.IIT,
    rating: 4.7,
    totalFees: 250000,
    overview: 'IIT Kanpur was established in 1959 and is known for its strong emphasis on research and innovation. The institute has produced several notable alumni in academia and industry.',
    established: 1959,
    website: 'https://www.iitk.ac.in',
    naacGrade: 'A++',
    nirfRank: 4,
    placementAvg: 2300000,
    placementMax: 55000000,
    placementPct: 93,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Texas Instruments', 'Flipkart'],
  },
  {
    name: 'Indian Institute of Technology Kharagpur',
    slug: 'iit-kharagpur',
    location: 'Kharagpur, West Bengal',
    city: 'Kharagpur',
    state: 'West Bengal',
    type: CollegeType.IIT,
    rating: 4.7,
    totalFees: 250000,
    overview: 'IIT Kharagpur is the oldest IIT, established in 1951. It has the largest campus among all IITs and offers a diverse range of programs across multiple disciplines.',
    established: 1951,
    website: 'https://www.iitkgp.ac.in',
    naacGrade: 'A++',
    nirfRank: 5,
    placementAvg: 2300000,
    placementMax: 52000000,
    placementPct: 93,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Cisco', 'JP Morgan'],
  },
  {
    name: 'Indian Institute of Technology Roorkee',
    slug: 'iit-roorkee',
    location: 'Roorkee, Uttarakhand',
    city: 'Roorkee',
    state: 'Uttarakhand',
    type: CollegeType.IIT,
    rating: 4.6,
    totalFees: 250000,
    overview: 'IIT Roorkee, established in 1847 as the Thomason College of Civil Engineering, is the oldest engineering institution in Asia. It became an IIT in 2001.',
    established: 1847,
    website: 'https://www.iitr.ac.in',
    naacGrade: 'A++',
    nirfRank: 6,
    placementAvg: 2200000,
    placementMax: 48000000,
    placementPct: 92,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'HCL', 'Deloitte'],
  },
  {
    name: 'Indian Institute of Technology Guwahati',
    slug: 'iit-guwahati',
    location: 'Guwahati, Assam',
    city: 'Guwahati',
    state: 'Assam',
    type: CollegeType.IIT,
    rating: 4.6,
    totalFees: 250000,
    overview: 'IIT Guwahati was established in 1994 and has quickly risen to become one of the top engineering institutes in India. It is known for its scenic campus and strong academic programs.',
    established: 1994,
    website: 'https://www.iitg.ac.in',
    naacGrade: 'A++',
    nirfRank: 7,
    placementAvg: 2200000,
    placementMax: 45000000,
    placementPct: 92,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Uber', 'Samsung'],
  },
  {
    name: 'Indian Institute of Technology Bhubaneswar',
    slug: 'iit-bhubaneswar',
    location: 'Bhubaneswar, Odisha',
    city: 'Bhubaneswar',
    state: 'Odisha',
    type: CollegeType.IIT,
    rating: 4.3,
    totalFees: 240000,
    overview: 'IIT Bhubaneswar was established in 2008 and is one of the newer IITs. It has grown rapidly and offers quality education across various engineering disciplines.',
    established: 2008,
    website: 'https://www.iitbbs.ac.in',
    naacGrade: 'A',
    nirfRank: 26,
    placementAvg: 1800000,
    placementMax: 32000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Adobe', 'Intel', 'Deloitte'],
  },
  {
    name: 'Indian Institute of Technology Gandhinagar',
    slug: 'iit-gandhinagar',
    location: 'Gandhinagar, Gujarat',
    city: 'Gandhinagar',
    state: 'Gujarat',
    type: CollegeType.IIT,
    rating: 4.4,
    totalFees: 240000,
    overview: 'IIT Gandhinagar was established in 2008 and has quickly gained recognition for its innovative curriculum and interdisciplinary approach to education.',
    established: 2008,
    website: 'https://www.iitgn.ac.in',
    naacGrade: 'A++',
    nirfRank: 17,
    placementAvg: 2000000,
    placementMax: 38000000,
    placementPct: 90,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
  },
  {
    name: 'Indian Institute of Technology Hyderabad',
    slug: 'iit-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.IIT,
    rating: 4.5,
    totalFees: 240000,
    overview: 'IIT Hyderabad was established in 2008 and has emerged as one of the top engineering institutes in India with a strong focus on research and innovation.',
    established: 2008,
    website: 'https://www.iith.ac.in',
    naacGrade: 'A++',
    nirfRank: 8,
    placementAvg: 2100000,
    placementMax: 42000000,
    placementPct: 92,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'NVIDIA', 'Qualcomm'],
  },
  {
    name: 'Indian Institute of Technology Jodhpur',
    slug: 'iit-jodhpur',
    location: 'Jodhpur, Rajasthan',
    city: 'Jodhpur',
    state: 'Rajasthan',
    type: CollegeType.IIT,
    rating: 4.2,
    totalFees: 240000,
    overview: 'IIT Jodhpur was established in 2008 and has been growing with a focus on interdisciplinary research and technology-driven education.',
    established: 2008,
    website: 'https://www.iitj.ac.in',
    naacGrade: 'A',
    nirfRank: 29,
    placementAvg: 1700000,
    placementMax: 30000000,
    placementPct: 87,
    topRecruiters: ['Amazon', 'Microsoft', 'Adobe', 'TCS', 'Infosys'],
  },
  {
    name: 'Indian Institute of Technology (BHU) Varanasi',
    slug: 'iit-bhu-varanasi',
    location: 'Varanasi, Uttar Pradesh',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: CollegeType.IIT,
    rating: 4.5,
    totalFees: 250000,
    overview: 'IIT BHU Varanasi was established in 1919 as Banaras Engineering College and became an IIT in 2012. It combines a rich heritage with modern education.',
    established: 1919,
    website: 'https://www.iitbhu.ac.in',
    naacGrade: 'A++',
    nirfRank: 10,
    placementAvg: 2200000,
    placementMax: 40000000,
    placementPct: 91,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'National Institute of Technology Tiruchirappalli',
    slug: 'nit-tiruchirappalli',
    location: 'Tiruchirappalli, Tamil Nadu',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: CollegeType.NIT,
    rating: 4.5,
    totalFees: 180000,
    overview: 'NIT Tiruchirappalli is one of the oldest and most prestigious NITs in India. Established in 1964, it offers excellent engineering education and has a strong placement record.',
    established: 1964,
    website: 'https://www.nitt.edu',
    naacGrade: 'A++',
    nirfRank: 9,
    placementAvg: 2000000,
    placementMax: 42000000,
    placementPct: 90,
    topRecruiters: ['Amazon', 'Microsoft', 'Intel', 'Qualcomm', 'Cisco'],
  },
  {
    name: 'National Institute of Technology Karnataka, Surathkal',
    slug: 'nit-surathkal',
    location: 'Mangalore, Karnataka',
    city: 'Mangalore',
    state: 'Karnataka',
    type: CollegeType.NIT,
    rating: 4.4,
    totalFees: 180000,
    overview: 'NIT Surathkal, established in 1960, is located on the shores of the Arabian Sea. It is known for its strong engineering programs and high placement rates.',
    established: 1960,
    website: 'https://www.nitk.ac.in',
    naacGrade: 'A++',
    nirfRank: 11,
    placementAvg: 1900000,
    placementMax: 38000000,
    placementPct: 89,
    topRecruiters: ['Amazon', 'Microsoft', 'Adobe', 'Goldman Sachs', 'Samsung'],
  },
  {
    name: 'National Institute of Technology Warangal',
    slug: 'nit-warangal',
    location: 'Warangal, Telangana',
    city: 'Warangal',
    state: 'Telangana',
    type: CollegeType.NIT,
    rating: 4.4,
    totalFees: 180000,
    overview: 'NIT Warangal, established in 1959, is one of the leading NITs with a rich history and strong industry connections. It offers outstanding engineering programs.',
    established: 1959,
    website: 'https://www.nitw.ac.in',
    naacGrade: 'A++',
    nirfRank: 12,
    placementAvg: 1900000,
    placementMax: 35000000,
    placementPct: 89,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Intel', 'Deloitte'],
  },
  {
    name: 'National Institute of Technology Rourkela',
    slug: 'nit-rourkela',
    location: 'Rourkela, Odisha',
    city: 'Rourkela',
    state: 'Odisha',
    type: CollegeType.NIT,
    rating: 4.3,
    totalFees: 180000,
    overview: 'NIT Rourkela was established in 1961 and is known for its strong research focus and excellent placement record across multiple engineering disciplines.',
    established: 1961,
    website: 'https://www.nitrkl.ac.in',
    naacGrade: 'A++',
    nirfRank: 14,
    placementAvg: 1800000,
    placementMax: 32000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Tata Steel', 'L&T', 'Accenture'],
  },
  {
    name: 'National Institute of Technology Calicut',
    slug: 'nit-calicut',
    location: 'Kozhikode, Kerala',
    city: 'Kozhikode',
    state: 'Kerala',
    type: CollegeType.NIT,
    rating: 4.3,
    totalFees: 180000,
    overview: 'NIT Calicut was established in 1961 and is located in a scenic campus. It offers quality engineering education with a strong emphasis on research and innovation.',
    established: 1961,
    website: 'https://www.nitc.ac.in',
    naacGrade: 'A++',
    nirfRank: 15,
    placementAvg: 1800000,
    placementMax: 30000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'Wipro', 'IBM'],
  },
  {
    name: 'National Institute of Technology Durgapur',
    slug: 'nit-durgapur',
    location: 'Durgapur, West Bengal',
    city: 'Durgapur',
    state: 'West Bengal',
    type: CollegeType.NIT,
    rating: 4.2,
    totalFees: 170000,
    overview: 'NIT Durgapur, established in 1960, is a leading engineering institution in Eastern India known for its strong academics and placement record.',
    established: 1960,
    website: 'https://www.nitdgp.ac.in',
    naacGrade: 'A+',
    nirfRank: 18,
    placementAvg: 1700000,
    placementMax: 28000000,
    placementPct: 87,
    topRecruiters: ['Amazon', 'Microsoft', 'Capgemini', 'TCS', 'Cognizant'],
  },
  {
    name: 'Motilal Nehru National Institute of Technology Allahabad',
    slug: 'nit-allahabad',
    location: 'Prayagraj, Uttar Pradesh',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: CollegeType.NIT,
    rating: 4.2,
    totalFees: 170000,
    overview: 'MNNIT Allahabad was established in 1961 and has a strong tradition of academic excellence. It offers a wide range of engineering and technology programs.',
    established: 1961,
    website: 'https://www.mnnit.ac.in',
    naacGrade: 'A+',
    nirfRank: 19,
    placementAvg: 1700000,
    placementMax: 26000000,
    placementPct: 87,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'Wipro', 'HCL'],
  },
  {
    name: 'National Institute of Technology Patna',
    slug: 'nit-patna',
    location: 'Patna, Bihar',
    city: 'Patna',
    state: 'Bihar',
    type: CollegeType.NIT,
    rating: 4.0,
    totalFees: 170000,
    overview: 'NIT Patna was established in 1886 as Bihar School of Engineering and later became an NIT. It is one of the oldest engineering colleges in India.',
    established: 1886,
    website: 'https://www.nitp.ac.in',
    naacGrade: 'A+',
    nirfRank: 32,
    placementAvg: 1600000,
    placementMax: 25000000,
    placementPct: 85,
    topRecruiters: ['Amazon', 'Infosys', 'TCS', 'Wipro', 'Accenture'],
  },
  {
    name: 'National Institute of Technology Silchar',
    slug: 'nit-silchar',
    location: 'Silchar, Assam',
    city: 'Silchar',
    state: 'Assam',
    type: CollegeType.NIT,
    rating: 3.9,
    totalFees: 170000,
    overview: 'NIT Silchar was established in 1967 and offers quality engineering education in the northeastern region of India.',
    established: 1967,
    website: 'https://www.nits.ac.in',
    naacGrade: 'A+',
    nirfRank: 36,
    placementAvg: 1400000,
    placementMax: 22000000,
    placementPct: 82,
    topRecruiters: ['Amazon', 'Infosys', 'TCS', 'Wipro', 'Capgemini'],
  },
  {
    name: 'National Institute of Technology Hamirpur',
    slug: 'nit-hamirpur',
    location: 'Hamirpur, Himachal Pradesh',
    city: 'Hamirpur',
    state: 'Himachal Pradesh',
    type: CollegeType.NIT,
    rating: 3.8,
    totalFees: 170000,
    overview: 'NIT Hamirpur was established in 1986 and is situated in the scenic state of Himachal Pradesh, offering good engineering programs.',
    established: 1986,
    website: 'https://www.nith.ac.in',
    naacGrade: 'A+',
    nirfRank: 40,
    placementAvg: 1300000,
    placementMax: 20000000,
    placementPct: 80,
    topRecruiters: ['Amazon', 'Infosys', 'TCS', 'Wipro', 'HCL'],
  },
  {
    name: 'National Institute of Technology Meghalaya',
    slug: 'nit-meghalaya',
    location: 'Shillong, Meghalaya',
    city: 'Shillong',
    state: 'Meghalaya',
    type: CollegeType.NIT,
    rating: 3.6,
    totalFees: 160000,
    overview: 'NIT Meghalaya was established in 2010 and is one of the newer NITs, offering programs in engineering and technology.',
    established: 2010,
    website: 'https://www.nitm.ac.in',
    naacGrade: 'A',
    nirfRank: 65,
    placementAvg: 1000000,
    placementMax: 15000000,
    placementPct: 75,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture'],
  },
  {
    name: 'National Institute of Technology Sikkim',
    slug: 'nit-sikkim',
    location: 'Ravangla, Sikkim',
    city: 'Ravangla',
    state: 'Sikkim',
    type: CollegeType.NIT,
    rating: 3.5,
    totalFees: 160000,
    overview: 'NIT Sikkim was established in 2010 and provides quality technical education in the Himalayan state of Sikkim.',
    established: 2010,
    website: 'https://www.nitsikkim.ac.in',
    naacGrade: 'A',
    nirfRank: 70,
    placementAvg: 900000,
    placementMax: 12000000,
    placementPct: 72,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture'],
  },
  {
    name: 'Sardar Vallabhbhai National Institute of Technology',
    slug: 'svnit-surat',
    location: 'Surat, Gujarat',
    city: 'Surat',
    state: 'Gujarat',
    type: CollegeType.NIT,
    rating: 4.1,
    totalFees: 180000,
    overview: 'SVNIT Surat was established in 1961 and is a leading NIT known for its strong engineering programs and industry connections.',
    established: 1961,
    website: 'https://www.svnit.ac.in',
    naacGrade: 'A+',
    nirfRank: 21,
    placementAvg: 1800000,
    placementMax: 30000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'TCS'],
  },
  {
    name: 'International Institute of Information Technology Hyderabad',
    slug: 'iiit-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.IIIT,
    rating: 4.5,
    totalFees: 400000,
    overview: 'IIIT Hyderabad was established in 1998 and is a premier research institute known for its strong focus on computer science and information technology.',
    established: 1998,
    website: 'https://www.iiit.ac.in',
    naacGrade: 'A++',
    nirfRank: 8,
    placementAvg: 2800000,
    placementMax: 50000000,
    placementPct: 95,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple'],
  },
  {
    name: 'International Institute of Information Technology Bangalore',
    slug: 'iiit-bangalore',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    type: CollegeType.IIIT,
    rating: 4.4,
    totalFees: 380000,
    overview: 'IIIT Bangalore is a premier research institute established in 1999 with a focus on information technology, computer science, and interdisciplinary research.',
    established: 1999,
    website: 'https://www.iiitb.ac.in',
    naacGrade: 'A++',
    nirfRank: 10,
    placementAvg: 2600000,
    placementMax: 45000000,
    placementPct: 94,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Uber'],
  },
  {
    name: 'International Institute of Information Technology Naya Raipur',
    slug: 'iiit-naya-raipur',
    location: 'Naya Raipur, Chhattisgarh',
    city: 'Naya Raipur',
    state: 'Chhattisgarh',
    type: CollegeType.IIIT,
    rating: 4.0,
    totalFees: 300000,
    overview: 'IIIT Naya Raipur is a relatively new institute established in 2013 with a focus on computer science and emerging technologies.',
    established: 2013,
    website: 'https://www.iiitnr.edu.in',
    naacGrade: 'A',
    nirfRank: 45,
    placementAvg: 1500000,
    placementMax: 25000000,
    placementPct: 85,
    topRecruiters: ['Amazon', 'Infosys', 'Wipro', 'TCS', 'Accenture'],
  },
  {
    name: 'Indian Institute of Information Technology Sri City',
    slug: 'iiit-sri-city',
    location: 'Sri City, Andhra Pradesh',
    city: 'Sri City',
    state: 'Andhra Pradesh',
    type: CollegeType.IIIT,
    rating: 3.9,
    totalFees: 280000,
    overview: 'IIIT Sri City was established in 2013 and offers undergraduate and graduate programs in computer science, electronics, and related fields.',
    established: 2013,
    website: 'https://www.iiits.in',
    naacGrade: 'A',
    nirfRank: 48,
    placementAvg: 1400000,
    placementMax: 22000000,
    placementPct: 84,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Cognizant'],
  },
  {
    name: 'Indian Institute of Information Technology Guwahati',
    slug: 'iiit-guwahati',
    location: 'Guwahati, Assam',
    city: 'Guwahati',
    state: 'Assam',
    type: CollegeType.IIIT,
    rating: 3.8,
    totalFees: 260000,
    overview: 'IIIT Guwahati was established in 2013 and has grown into a notable institution offering quality education in information technology.',
    established: 2013,
    website: 'https://www.iiitg.ac.in',
    naacGrade: 'A',
    nirfRank: 55,
    placementAvg: 1300000,
    placementMax: 20000000,
    placementPct: 83,
    topRecruiters: ['Amazon', 'Infosys', 'Wipro', 'TCS', 'Cognizant'],
  },
  {
    name: 'IIITDM Jabalpur',
    slug: 'iiitdm-jabalpur',
    location: 'Jabalpur, Madhya Pradesh',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    type: CollegeType.IIIT,
    rating: 3.8,
    totalFees: 250000,
    overview: 'IIITDM Jabalpur was established in 2005 with a focus on design and manufacturing engineering alongside computer science.',
    established: 2005,
    website: 'https://www.iiitdmj.ac.in',
    naacGrade: 'A',
    nirfRank: 44,
    placementAvg: 1400000,
    placementMax: 24000000,
    placementPct: 84,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'L&T'],
  },
  {
    name: 'IIIT Allahabad',
    slug: 'iiit-allahabad',
    location: 'Prayagraj, Uttar Pradesh',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: CollegeType.IIIT,
    rating: 4.1,
    totalFees: 280000,
    overview: 'IIIT Allahabad was established in 1999 and is a premier institute known for its strong computer science and IT programs.',
    established: 1999,
    website: 'https://www.iiita.ac.in',
    naacGrade: 'A++',
    nirfRank: 28,
    placementAvg: 1800000,
    placementMax: 30000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Adobe', 'Infosys'],
  },
  {
    name: 'IIITDM Kancheepuram',
    slug: 'iiitdm-kancheepuram',
    location: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: CollegeType.IIIT,
    rating: 3.7,
    totalFees: 250000,
    overview: 'IIITDM Kancheepuram was established in 2007 and focuses on design and manufacturing engineering with modern curriculum.',
    established: 2007,
    website: 'https://www.iiitdm.ac.in',
    naacGrade: 'A',
    nirfRank: 49,
    placementAvg: 1300000,
    placementMax: 22000000,
    placementPct: 82,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'L&T'],
  },
  {
    name: 'Jawaharlal Nehru Technological University Hyderabad',
    slug: 'jntuh-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 3.9,
    totalFees: 120000,
    overview: 'JNTU Hyderabad is one of the leading technical universities in Telangana, established in 1972. It offers a wide range of engineering programs across multiple affiliated colleges.',
    established: 1972,
    website: 'https://www.jntuh.ac.in',
    naacGrade: 'A+',
    nirfRank: 30,
    placementAvg: 800000,
    placementMax: 18000000,
    placementPct: 75,
    topRecruiters: ['Amazon', 'Infosys', 'TCS', 'Wipro', 'Cognizant'],
  },
  {
    name: 'Osmania University College of Engineering',
    slug: 'ouce-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 4.0,
    totalFees: 100000,
    overview: 'OUCE is one of the oldest engineering colleges in India, established in 1929. It is known for its strong academic tradition and beautiful campus.',
    established: 1929,
    website: 'https://www.osmania.ac.in',
    naacGrade: 'A+',
    nirfRank: 25,
    placementAvg: 900000,
    placementMax: 20000000,
    placementPct: 78,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Wipro'],
  },
  {
    name: 'University of Hyderabad',
    slug: 'uoh-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 4.2,
    totalFees: 80000,
    overview: 'The University of Hyderabad is a central university established in 1974. Its engineering programs are known for quality education at an affordable cost.',
    established: 1974,
    website: 'https://www.uohyd.ac.in',
    naacGrade: 'A++',
    nirfRank: 15,
    placementAvg: 1200000,
    placementMax: 22000000,
    placementPct: 80,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Deloitte'],
  },
  {
    name: 'Delhi Technological University',
    slug: 'dtu-delhi',
    location: 'New Delhi, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: CollegeType.STATE,
    rating: 4.3,
    totalFees: 220000,
    overview: 'DTU, formerly Delhi College of Engineering, is one of the premier engineering institutions in India with a rich history dating back to 1941.',
    established: 1941,
    website: 'https://www.dtu.ac.in',
    naacGrade: 'A+',
    nirfRank: 27,
    placementAvg: 2000000,
    placementMax: 35000000,
    placementPct: 90,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'Punjab Engineering College',
    slug: 'pec-chandigarh',
    location: 'Chandigarh, Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: CollegeType.STATE,
    rating: 4.1,
    totalFees: 200000,
    overview: 'PEC was established in 1921 and is one of the oldest engineering institutions in India. It has a strong alumni network and placement record.',
    established: 1921,
    website: 'https://www.pec.ac.in',
    naacGrade: 'A+',
    nirfRank: 33,
    placementAvg: 1800000,
    placementMax: 30000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'TCS'],
  },
  {
    name: 'Indian Institute of Engineering Science and Technology Shibpur',
    slug: 'iiests-shibpur',
    location: 'Shibpur, West Bengal',
    city: 'Shibpur',
    state: 'West Bengal',
    type: CollegeType.STATE,
    rating: 4.0,
    totalFees: 150000,
    overview: 'IIEST Shibpur, established in 1856 as Bengal Engineering College, is one of the oldest engineering institutions in India. It became an IIEST in 2014.',
    established: 1856,
    website: 'https://www.iiests.ac.in',
    naacGrade: 'A+',
    nirfRank: 34,
    placementAvg: 1500000,
    placementMax: 25000000,
    placementPct: 83,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'L&T'],
  },
  {
    name: 'College of Engineering Pune',
    slug: 'coep-pune',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    type: CollegeType.STATE,
    rating: 4.1,
    totalFees: 160000,
    overview: 'COEP was established in 1854 and is one of the oldest engineering colleges in Asia. It has a rich legacy of producing excellent engineers.',
    established: 1854,
    website: 'https://www.coep.org.in',
    naacGrade: 'A+',
    nirfRank: 31,
    placementAvg: 1700000,
    placementMax: 28000000,
    placementPct: 86,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'Deloitte'],
  },
  {
    name: 'Vellore Institute of Technology',
    slug: 'vit-vellore',
    location: 'Vellore, Tamil Nadu',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: CollegeType.DEEMED,
    rating: 4.3,
    totalFees: 350000,
    overview: 'VIT Vellore is a deemed university established in 1984. It is one of the largest and most prestigious private engineering institutions in India with excellent placement record.',
    established: 1984,
    website: 'https://www.vit.ac.in',
    naacGrade: 'A++',
    nirfRank: 13,
    placementAvg: 1900000,
    placementMax: 38000000,
    placementPct: 92,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Intel', 'Cisco'],
  },
  {
    name: 'Birla Institute of Technology and Science Pilani',
    slug: 'bits-pilani',
    location: 'Pilani, Rajasthan',
    city: 'Pilani',
    state: 'Rajasthan',
    type: CollegeType.DEEMED,
    rating: 4.5,
    totalFees: 500000,
    overview: 'BITS Pilani is a premier deemed university established in 1964. It is known for its academic excellence, vibrant campus life, and outstanding placement record.',
    established: 1964,
    website: 'https://www.bits-pilani.ac.in',
    naacGrade: 'A++',
    nirfRank: 16,
    placementAvg: 2400000,
    placementMax: 45000000,
    placementPct: 93,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
  },
  {
    name: 'Amrita Vishwa Vidyapeetham',
    slug: 'amrita-coimbatore',
    location: 'Coimbatore, Tamil Nadu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    type: CollegeType.DEEMED,
    rating: 4.2,
    totalFees: 320000,
    overview: 'Amrita Vishwa Vidyapeetham is a deemed university established in 1994 with multiple campuses across India. It offers excellent engineering programs with a focus on research.',
    established: 1994,
    website: 'https://www.amrita.edu',
    naacGrade: 'A++',
    nirfRank: 20,
    placementAvg: 1700000,
    placementMax: 30000000,
    placementPct: 88,
    topRecruiters: ['Amazon', 'Microsoft', 'Intel', 'Infosys', 'Wipro'],
  },
  {
    name: 'SRM Institute of Science and Technology',
    slug: 'srm-chennai',
    location: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: CollegeType.DEEMED,
    rating: 4.0,
    totalFees: 350000,
    overview: 'SRM IST is a deemed university established in 1985. It is one of the largest private engineering universities in India with a strong placement record.',
    established: 1985,
    website: 'https://www.srmist.edu.in',
    naacGrade: 'A++',
    nirfRank: 24,
    placementAvg: 1500000,
    placementMax: 28000000,
    placementPct: 85,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Wipro', 'Cognizant'],
  },
  {
    name: 'Manipal Institute of Technology',
    slug: 'mit-manipal',
    location: 'Manipal, Karnataka',
    city: 'Manipal',
    state: 'Karnataka',
    type: CollegeType.DEEMED,
    rating: 4.1,
    totalFees: 380000,
    overview: 'MIT Manipal is a deemed university established in 1957. It is one of the oldest private engineering colleges in India with a strong focus on innovation.',
    established: 1957,
    website: 'https://www.manipal.edu/mit',
    naacGrade: 'A++',
    nirfRank: 22,
    placementAvg: 1600000,
    placementMax: 30000000,
    placementPct: 86,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'Deloitte'],
  },
  {
    name: 'Koneru Lakshmaiah Education Foundation',
    slug: 'kl-ef-vaddeswaram',
    location: 'Vaddeswaram, Andhra Pradesh',
    city: 'Vaddeswaram',
    state: 'Andhra Pradesh',
    type: CollegeType.DEEMED,
    rating: 3.9,
    totalFees: 300000,
    overview: 'KL Deemed to be University was established in 1980 and is one of the leading private universities in Andhra Pradesh with good placement record.',
    established: 1980,
    website: 'https://www.kluniversity.in',
    naacGrade: 'A++',
    nirfRank: 30,
    placementAvg: 1000000,
    placementMax: 20000000,
    placementPct: 80,
    topRecruiters: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Cognizant'],
  },
  {
    name: 'Chaitanya Bharathi Institute of Technology',
    slug: 'cbit-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.PRIVATE,
    rating: 3.7,
    totalFees: 150000,
    overview: 'CBIT was established in 1979 and is one of the oldest private engineering colleges in Telangana with good academic reputation and placement opportunities.',
    established: 1979,
    website: 'https://www.cbit.ac.in',
    naacGrade: 'A+',
    nirfRank: 50,
    placementAvg: 600000,
    placementMax: 12000000,
    placementPct: 70,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'Vasavi College of Engineering',
    slug: 'vasavi-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.PRIVATE,
    rating: 3.7,
    totalFees: 140000,
    overview: 'Vasavi College of Engineering was established in 1981 and is known for its quality education and consistent academic performance in Hyderabad.',
    established: 1981,
    website: 'https://www.vce.ac.in',
    naacGrade: 'A+',
    nirfRank: 52,
    placementAvg: 550000,
    placementMax: 11000000,
    placementPct: 68,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture'],
  },
  {
    name: 'University College of Engineering, JNTU Kakinada',
    slug: 'jntuk-kakinada',
    location: 'Kakinada, Andhra Pradesh',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    type: CollegeType.STATE,
    rating: 3.8,
    totalFees: 110000,
    overview: 'JNTU Kakinada is a premier engineering university in Andhra Pradesh offering diverse engineering programs with good placement opportunities.',
    established: 1976,
    website: 'https://www.jntuk.edu.in',
    naacGrade: 'A+',
    nirfRank: 35,
    placementAvg: 750000,
    placementMax: 15000000,
    placementPct: 72,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'Andhra University College of Engineering',
    slug: 'auce-visakhapatnam',
    location: 'Visakhapatnam, Andhra Pradesh',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: CollegeType.STATE,
    rating: 3.8,
    totalFees: 100000,
    overview: 'Andhra University College of Engineering, established in 1955, is one of the oldest engineering colleges in Andhra Pradesh with a strong academic record.',
    established: 1955,
    website: 'https://www.andhrauniversity.edu.in',
    naacGrade: 'A+',
    nirfRank: 38,
    placementAvg: 700000,
    placementMax: 14000000,
    placementPct: 70,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'HCL'],
  },
  {
    name: 'G. Pulla Reddy Engineering College',
    slug: 'gpr-ec-kurnool',
    location: 'Kurnool, Andhra Pradesh',
    city: 'Kurnool',
    state: 'Andhra Pradesh',
    type: CollegeType.PRIVATE,
    rating: 3.6,
    totalFees: 130000,
    overview: 'GPREC was established in 1985 and is one of the reputed private engineering colleges in Andhra Pradesh known for good infrastructure and placements.',
    established: 1985,
    website: 'https://www.gprec.ac.in',
    naacGrade: 'A+',
    nirfRank: 60,
    placementAvg: 500000,
    placementMax: 10000000,
    placementPct: 65,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'RVR & JC College of Engineering',
    slug: 'rvrjc-guntur',
    location: 'Guntur, Andhra Pradesh',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    type: CollegeType.PRIVATE,
    rating: 3.6,
    totalFees: 120000,
    overview: 'RVR & JC College of Engineering was established in 1985 and is known for its strong alumni network and good academic standards in Andhra Pradesh.',
    established: 1985,
    website: 'https://www.rvrjc.ac.in',
    naacGrade: 'A+',
    nirfRank: 58,
    placementAvg: 520000,
    placementMax: 10500000,
    placementPct: 66,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture'],
  },
  {
    name: 'Sri Venkateswara University College of Engineering',
    slug: 'svu-tirupati',
    location: 'Tirupati, Andhra Pradesh',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    type: CollegeType.STATE,
    rating: 3.7,
    totalFees: 90000,
    overview: 'SVU College of Engineering was established in 1959 and is one of the premier engineering institutions in Andhra Pradesh with affordable fees.',
    established: 1959,
    website: 'https://www.svuniversity.edu.in',
    naacGrade: 'A+',
    nirfRank: 42,
    placementAvg: 600000,
    placementMax: 12000000,
    placementPct: 68,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini'],
  },
];

type CutoffInput = {
  collegeSlug: string;
  exam: ExamType;
  category: Category;
  rankMin: number;
  rankMax: number;
  year: number;
  branch: string | null;
};

function loadJeeAdvancedCutoffs(
  slugToDatasetName: Map<string, string>,
  dataPath: string,
): CutoffInput[] {
  type Row = {
    Institute: string;
    'Academic Program Name': string;
    'Seat Type': string;
    'Opening Rank': string | number;
    'Closing Rank': string | number;
  };

  const xlsx = require('xlsx');
  const wb = xlsx.readFile(dataPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Row[] = xlsx.utils.sheet_to_json(ws);

  const seatToCat: Record<string, Category> = {
    'OPEN': Category.GENERAL,
    'EWS': Category.EWS,
    'OBC-NCL': Category.OBC,
    'SC': Category.SC,
    'ST': Category.ST,
  };

  const datasetNameToSlug = new Map<string, string>();
  for (const [slug, name] of slugToDatasetName) {
    datasetNameToSlug.set(name, slug);
  }

  const cutoffs: CutoffInput[] = [];

  for (const row of rows) {
    const slug = datasetNameToSlug.get(row['Institute']);
    if (!slug) continue;
    const cat = seatToCat[row['Seat Type']];
    if (!cat) continue;

    const openRank = parseInt(String(row['Opening Rank']));
    const closeRank = parseInt(String(row['Closing Rank']));
    if (isNaN(openRank) || isNaN(closeRank)) continue;

    const branchRaw = String(row['Academic Program Name'] ?? '');
    const branch = branchRaw.replace(/\s*\(.*?\)\s*/g, '').trim();

    cutoffs.push({
      collegeSlug: slug,
      exam: ExamType.JEE_ADVANCED,
      category: cat,
      rankMin: Math.min(openRank, closeRank),
      rankMax: Math.max(openRank, closeRank),
      year: 2024,
      branch,
    });
  }

  return cutoffs;
}

function loadJeeMainsNitsCutoffs(
  slugToDatasetName: Map<string, string>,
  csvPath: string,
): CutoffInput[] {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  type Row = {
    Year: string;
    Institute: string;
    Branch: string;
    Category: string;
    Opening_Rank: string;
    Closing_Rank: string;
  };
  const rows: Row[] = parse(raw, { columns: true, skip_empty_lines: true });
  const rows2024 = rows.filter((r) => String(r.Year) === '2024');

  const catMap: Record<string, Category> = {
    General: Category.GENERAL,
    'OBC-NCL': Category.OBC,
    SC: Category.SC,
    ST: Category.ST,
    EWS: Category.EWS,
  };

  const datasetNameToSlug = new Map<string, string>();
  for (const [slug, name] of slugToDatasetName) {
    datasetNameToSlug.set(name, slug);
  }

  const cutoffs: CutoffInput[] = [];
  for (const row of rows2024) {
    const slug = datasetNameToSlug.get(row.Institute);
    if (!slug) continue;
    const cat = catMap[row.Category];
    if (!cat) continue;

    const openRank = parseInt(row.Opening_Rank);
    const closeRank = parseInt(row.Closing_Rank);
    if (isNaN(openRank) || isNaN(closeRank)) continue;

    cutoffs.push({
      collegeSlug: slug,
      exam: ExamType.JEE_MAINS,
      category: cat,
      rankMin: Math.min(openRank, closeRank),
      rankMax: Math.max(openRank, closeRank),
      year: 2024,
      branch: row.Branch,
    });
  }
  return cutoffs;
}

function loadEamcetCutoffs(
  slugToDatasetName: Map<string, string>,
  phase1Path: string,
  phase3Path: string,
  exam: ExamType,
): CutoffInput[] {
  const parseEamcet = (csvPath: string) => {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    return parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  };

  const p1Rows = parseEamcet(phase1Path);
  const p3Rows = parseEamcet(phase3Path);

  type EamcetKey = string;
  const makeKey = (r: Record<string, string>) =>
    `${r['College Name']}|||${r['Branch Name']}`;

  const p1Map = new Map<EamcetKey, Record<string, string>>();
  for (const row of p1Rows) {
    p1Map.set(makeKey(row), row);
  }

  const CAT_COLS: Array<{ col: string; cat: Category }> = [
    { col: 'OC Boys', cat: Category.GENERAL },
    { col: 'EWS Boys', cat: Category.EWS },
    { col: 'SC Boys', cat: Category.SC },
    { col: 'ST Boys', cat: Category.ST },
    { col: 'BC-A Boys', cat: Category.OBC },
  ];

  const datasetNameToSlug = new Map<string, string>();
  for (const [slug, name] of slugToDatasetName) {
    datasetNameToSlug.set(name, slug);
  }

  const cutoffs: CutoffInput[] = [];

  for (const p3Row of p3Rows) {
    const slug = datasetNameToSlug.get(p3Row['College Name']);
    if (!slug) continue;

    const p1Row = p1Map.get(makeKey(p3Row));
    if (!p1Row) continue;

    for (const { col, cat } of CAT_COLS) {
      const openVal = parseFloat(p1Row[col] ?? '');
      const closeVal = parseFloat(p3Row[col] ?? '');
      if (isNaN(openVal) || isNaN(closeVal) || openVal <= 0 || closeVal <= 0) continue;

      cutoffs.push({
        collegeSlug: slug,
        exam,
        category: cat,
        rankMin: Math.round(Math.min(openVal, closeVal)),
        rankMax: Math.round(Math.max(openVal, closeVal)),
        year: 2024,
        branch: p3Row['Branch Name'],
      });
    }
  }

  return cutoffs;
}

const reviewsData = [
  { collegeSlug: 'iit-madras', author: 'Ananya', rating: 5, body: 'Excellent faculty and world-class infrastructure. The research opportunities are unparalleled.', category: 'Academics' },
  { collegeSlug: 'iit-madras', author: 'Rahul', rating: 4, body: 'Great campus life with amazing cultural events. Placements are top notch.', category: 'Placements' },
  { collegeSlug: 'iit-delhi', author: 'Priya', rating: 5, body: 'The best learning environment I could have asked for. Professors are highly supportive.', category: 'Academics' },
  { collegeSlug: 'iit-bombay', author: 'Amit', rating: 5, body: 'Amazing peer group and excellent industry connections. The hostel facilities are great.', category: 'Infrastructure' },
  { collegeSlug: 'nit-tiruchirappalli', author: 'Karthik', rating: 4, body: 'Great NIT with good placements. The campus is beautiful and well maintained.', category: 'Overall' },
  { collegeSlug: 'nit-warangal', author: 'Sneha', rating: 4, body: 'Strong academic curriculum and good faculty. Placement training is excellent.', category: 'Placements' },
  { collegeSlug: 'iiit-hyderabad', author: 'Vikram', rating: 5, body: 'Outstanding research environment. The coding culture here is incredible.', category: 'Academics' },
  { collegeSlug: 'vit-vellore', author: 'Divya', rating: 4, body: 'Good infrastructure and lots of opportunities. The semester abroad program is a plus.', category: 'Infrastructure' },
  { collegeSlug: 'bits-pilani', author: 'Arjun', rating: 5, body: 'Pilani is a truly transformative experience. The practice school program is unique.', category: 'Overall' },
  { collegeSlug: 'iit-kharagpur', author: 'Neha', rating: 4, body: 'The largest IIT campus with so many clubs and activities. Placements are strong.', category: 'Campus Life' },
  { collegeSlug: 'iit-guwahati', author: 'Rohit', rating: 5, body: 'Beautiful campus by the Brahmaputra. Excellent academics and research opportunities.', category: 'Infrastructure' },
  { collegeSlug: 'nit-rourkela', author: 'Swati', rating: 4, body: 'Good engineering education with decent placements. The campus is peaceful.', category: 'Academics' },
  { collegeSlug: 'dtu-delhi', author: 'Aman', rating: 4, body: 'Great location in Delhi. Placements are very good and the alumni network is strong.', category: 'Placements' },
  { collegeSlug: 'iiit-bangalore', author: 'Manish', rating: 5, body: 'Excellent industry focused curriculum. Great placement record in top companies.', category: 'Placements' },
  { collegeSlug: 'iit-hyderabad', author: 'Pooja', rating: 5, body: 'Modern campus with great research facilities. The faculty is world class.', category: 'Academics' },
  { collegeSlug: 'cbit-hyderabad', author: 'Suresh', rating: 4, body: 'Good college with strong alumni network in Hyderabad. Placement support is decent.', category: 'Placements' },
  { collegeSlug: 'vasavi-hyderabad', author: 'Lakshmi', rating: 4, body: 'Excellent faculty and supportive environment. Campus is well maintained.', category: 'Academics' },
  { collegeSlug: 'jntuh-hyderabad', author: 'Ravi', rating: 3, body: 'Good university with large number of affiliated colleges. Infrastructure needs improvement.', category: 'Overall' },
];

async function main() {
  console.log('Seeding database...');

  for (const college of collegesData) {
    await prisma.college.upsert({
      where: { slug: college.slug },
      update: {},
      create: {
        name: college.name,
        slug: college.slug,
        location: college.location,
        city: college.city,
        state: college.state,
        type: college.type,
        rating: college.rating,
        totalFees: college.totalFees,
        overview: college.overview,
        established: college.established,
        website: college.website,
        naacGrade: college.naacGrade,
        nirfRank: college.nirfRank,
        placementAvg: college.placementAvg,
        placementMax: college.placementMax,
        placementPct: college.placementPct,
        topRecruiters: college.topRecruiters,
      },
    });
  }
  console.log(`Seeded ${collegesData.length} colleges`);

  const allColleges = await prisma.college.findMany();
  const slugToId = new Map(allColleges.map((c) => [c.slug, c.id]));

  const branches = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology',
  ];

  for (const college of collegesData) {
    const collegeId = slugToId.get(college.slug);
    if (!collegeId) continue;
    const nCourses = college.type === CollegeType.IIT ? 7 : college.type === CollegeType.NIT ? 6 : 5;
    for (let i = 0; i < nCourses; i++) {
      const branch = branches[i % branches.length]!;
      await prisma.course.create({
        data: {
          collegeId,
          name: branch,
          duration: 4,
          fees: college.totalFees,
          seats: Math.floor(Math.random() * 90) + 30,
        },
      });
    }
  }
  console.log('Seeded courses');

  const dataDir = path.join(__dirname, 'data');

  const iitSlugToName = new Map<string, string>([
    ['iit-madras', 'Indian Institute of Technology Madras'],
    ['iit-delhi', 'Indian Institute of Technology Delhi'],
    ['iit-bombay', 'Indian Institute of Technology Bombay'],
    ['iit-kanpur', 'Indian Institute of Technology Kanpur'],
    ['iit-kharagpur', 'Indian Institute of Technology Kharagpur'],
    ['iit-roorkee', 'Indian Institute of Technology Roorkee'],
    ['iit-guwahati', 'Indian Institute of Technology Guwahati'],
    ['iit-bhubaneswar', 'Indian Institute of Technology Bhubaneswar'],
    ['iit-gandhinagar', 'Indian Institute of Technology Gandhinagar'],
    ['iit-hyderabad', 'Indian Institute of Technology Hyderabad'],
    ['iit-jodhpur', 'Indian Institute of Technology Jodhpur'],
    ['iit-bhu-varanasi', 'Indian Institute of Technology (BHU) Varanasi'],
    ['nit-tiruchirappalli', 'National Institute of Technology, Tiruchirappalli'],
    ['nit-surathkal', 'National Institute of Technology Karnataka, Surathkal'],
    ['nit-warangal', 'National Institute of Technology, Warangal'],
    ['nit-rourkela', 'National Institute of Technology, Rourkela'],
    ['nit-calicut', 'National Institute of Technology Calicut'],
    ['nit-durgapur', 'National Institute of Technology Durgapur'],
    ['nit-allahabad', 'Motilal Nehru National Institute of Technology Allahabad'],
    ['nit-patna', 'National Institute of Technology Patna'],
    ['nit-silchar', 'National Institute of Technology, Silchar'],
    ['nit-hamirpur', 'National Institute of Technology Hamirpur'],
    ['nit-meghalaya', 'National Institute of Technology Meghalaya'],
    ['nit-sikkim', 'National Institute of Technology Sikkim'],
    ['svnit-surat', 'Sardar Vallabhbhai National Institute of Technology, Surat'],
    ['iiit-sri-city', 'Indian Institute of Information Technology (IIIT), Sri City, Chittoor'],
    ['iiit-guwahati', 'Indian Institute of Information Technology Guwahati'],
    ['iiitdm-jabalpur', 'Pt. Dwarka Prasad Mishra Indian Institute of Information Technology, Design & Manufacture Jabalpur'],
    ['iiit-allahabad', 'Indian Institute of Information Technology, Allahabad'],
    ['iiitdm-kancheepuram', 'Indian Institute of Information Technology, Design & Manufacturing, Kancheepuram'],
    ['iiests-shibpur', 'Indian Institute of Engineering Science and Technology, Shibpur'],
  ]);

  const nitCsvSlugToName = new Map<string, string>([
    ['nit-tiruchirappalli', 'NIT Trichy'],
    ['nit-surathkal', 'NIT Surathkal'],
    ['nit-warangal', 'NIT Warangal'],
    ['nit-rourkela', 'NIT Rourkela'],
    ['nit-allahabad', 'MNNIT Allahabad'],
    ['nit-calicut', 'NIT Calicut'],
    ['nit-durgapur', 'NIT Durgapur'],
    ['svnit-surat', 'SVNIT Surat'],
  ]);

  const tsEamcetSlugToName = new Map<string, string>([
    ['jntuh-hyderabad', 'JNTUH UNIVERSITY COLLEGE OF ENGG SCI AND TECH HYDERABAD HYDERABAD'],
    ['ouce-hyderabad', 'O U COLLEGE OF ENGG HYDERABAD HYDERABAD'],
    ['cbit-hyderabad', 'CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY GANDIPET'],
    ['vasavi-hyderabad', 'VASAVI COLLEGE OF ENGINEERING HYDERABAD'],
  ]);

  const round5Path = path.join(dataDir, '2024Round5.xlsx');
  const nitsCsvPath = path.join(dataDir, 'jee_college_cutoffs_nits.csv');
  const tsP1Path = path.join(dataDir, 'EAMCET_2024_Phase_1_Cutoffs.csv');
  const tsP3Path = path.join(dataDir, 'EAMCET_2024_Phase_3_Cutoffs.csv');

  const allCutoffs: CutoffInput[] = [];

  if (fs.existsSync(round5Path)) {
    const jeeAdvCutoffs = loadJeeAdvancedCutoffs(iitSlugToName, round5Path);
    allCutoffs.push(...jeeAdvCutoffs);
    console.log(`Loaded ${jeeAdvCutoffs.length} JEE Advanced cutoffs from Round5`);
  } else {
    console.warn(`Round5 xlsx not found at ${round5Path}, skipping JEE Advanced cutoffs`);
  }

  if (fs.existsSync(nitsCsvPath)) {
    const nitsCutoffs = loadJeeMainsNitsCutoffs(nitCsvSlugToName, nitsCsvPath);
    allCutoffs.push(...nitsCutoffs);
    console.log(`Loaded ${nitsCutoffs.length} JEE Mains NIT cutoffs`);
  } else {
    console.warn(`NIT CSV not found at ${nitsCsvPath}, skipping JEE Mains NIT cutoffs`);
  }

  if (fs.existsSync(tsP1Path) && fs.existsSync(tsP3Path)) {
    const tsCutoffs = loadEamcetCutoffs(tsEamcetSlugToName, tsP1Path, tsP3Path, ExamType.EAMCET_TS);
    allCutoffs.push(...tsCutoffs);
    console.log(`Loaded ${tsCutoffs.length} TS EAMCET cutoffs`);
  } else {
    console.warn('TS EAMCET phase CSVs not found, skipping');
  }

  let inserted = 0;
  for (const cutoff of allCutoffs) {
    const collegeId = slugToId.get(cutoff.collegeSlug);
    if (!collegeId) continue;
    await prisma.collegeCutoff.create({
      data: {
        collegeId,
        exam: cutoff.exam,
        category: cutoff.category,
        rankMin: cutoff.rankMin,
        rankMax: cutoff.rankMax,
        year: cutoff.year,
        branch: cutoff.branch ?? null,
      },
    });
    inserted++;
  }
  console.log(`Seeded ${inserted} cutoff records`);

  for (const review of reviewsData) {
    const collegeId = slugToId.get(review.collegeSlug);
    if (!collegeId) continue;
    await prisma.review.create({
      data: {
        collegeId,
        author: review.author,
        rating: review.rating,
        body: review.body,
        category: review.category,
      },
    });
  }
  console.log(`Seeded ${reviewsData.length} reviews`);

  await prisma.$executeRawUnsafe(`
    UPDATE "College" SET search_vector =
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(state, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(type::text, '')), 'C')
  `);
  console.log('Updated FTS search vectors');

  console.log('Seeding complete!');
}

main()
  .catch((e: unknown) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());