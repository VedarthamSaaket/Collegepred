import { PrismaClient, CollegeType, ExamType, Category } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// ─── Extra infrastructure/hostel/accreditation data per college slug ───
const extraCollegeData: Record<string, {
  campusArea: string;
  totalStudents: number;
  facultyStudentRatio: string;
  hostelAvailable: boolean;
  hostelCompulsory: boolean;
  hostelFeesPerYear: number;
  messFees: number;
  transportFees: number;
  tuitionFees: number;
  accreditations: string[];
}> = {
  // IITs
  'iit-madras':     { campusArea: '620 acres', totalStudents: 8500, facultyStudentRatio: '1:9',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 85000,  messFees: 45000,  transportFees: 8000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-delhi':      { campusArea: '325 acres', totalStudents: 9200, facultyStudentRatio: '1:10', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 82000,  messFees: 42000,  transportFees: 7000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-bombay':     { campusArea: '550 acres', totalStudents: 10000, facultyStudentRatio: '1:11', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 88000,  messFees: 46000,  transportFees: 7500,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-kanpur':     { campusArea: '1055 acres', totalStudents: 7800, facultyStudentRatio: '1:9',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 80000,  messFees: 40000,  transportFees: 6000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-kharagpur':  { campusArea: '2100 acres', totalStudents: 12000, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 78000,  messFees: 38000,  transportFees: 5000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-roorkee':    { campusArea: '365 acres', totalStudents: 9000, facultyStudentRatio: '1:10', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 76000,  messFees: 37000,  transportFees: 6000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-guwahati':   { campusArea: '705 acres', totalStudents: 7000, facultyStudentRatio: '1:8',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 74000,  messFees: 36000,  transportFees: 5500,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-hyderabad':  { campusArea: '576 acres', totalStudents: 5500, facultyStudentRatio: '1:9',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 72000,  messFees: 35000,  transportFees: 6000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-bhu-varanasi': { campusArea: '430 acres', totalStudents: 8000, facultyStudentRatio: '1:11', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 70000,  messFees: 34000,  transportFees: 5000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-bhubaneswar': { campusArea: '936 acres', totalStudents: 3500, facultyStudentRatio: '1:8',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 68000,  messFees: 33000,  transportFees: 5000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-gandhinagar': { campusArea: '400 acres', totalStudents: 3000, facultyStudentRatio: '1:8',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 66000,  messFees: 32000,  transportFees: 4500,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  'iit-jodhpur':    { campusArea: '852 acres', totalStudents: 3200, facultyStudentRatio: '1:9',  hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 64000,  messFees: 31000,  transportFees: 4000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A++'] },
  // NITs
  'nit-tiruchirappalli': { campusArea: '800 acres', totalStudents: 7500, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 62000,  messFees: 35000,  transportFees: 6000,   tuitionFees: 90000,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-surathkal':  { campusArea: '295 acres', totalStudents: 6000, facultyStudentRatio: '1:11', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 60000,  messFees: 34000,  transportFees: 5500,   tuitionFees: 90000,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-warangal':   { campusArea: '250 acres', totalStudents: 6800, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 58000,  messFees: 33000,  transportFees: 5000,   tuitionFees: 90000,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-rourkela':   { campusArea: '600 acres', totalStudents: 6500, facultyStudentRatio: '1:10', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 56000,  messFees: 32000,  transportFees: 4500,   tuitionFees: 87500,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-calicut':    { campusArea: '325 acres', totalStudents: 6000, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 54000,  messFees: 30000,  transportFees: 4000,   tuitionFees: 87500,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-durgapur':   { campusArea: '197 acres', totalStudents: 5500, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 52000,  messFees: 29000,  transportFees: 4000,   tuitionFees: 85000,  accreditations: ['NBA', 'NAAC A+'] },
  'nit-allahabad':  { campusArea: '220 acres', totalStudents: 5500, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 50000,  messFees: 28000,  transportFees: 3500,   tuitionFees: 85000,  accreditations: ['NBA', 'NAAC A+'] },
  'nit-karnataka':  { campusArea: '295 acres', totalStudents: 6200, facultyStudentRatio: '1:11', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 60000,  messFees: 34000,  transportFees: 5500,   tuitionFees: 90000,  accreditations: ['NBA', 'NAAC A++'] },
  'nit-patna':      { campusArea: '110 acres', totalStudents: 4500, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 48000,  messFees: 26000,  transportFees: 3000,   tuitionFees: 82500,  accreditations: ['NBA', 'NAAC A+'] },
  'nit-silchar':    { campusArea: '185 acres', totalStudents: 4000, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 46000,  messFees: 25000,  transportFees: 3000,   tuitionFees: 80000,  accreditations: ['NBA', 'NAAC A+'] },
  'nit-hamirpur':   { campusArea: '195 acres', totalStudents: 3800, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 44000,  messFees: 24000,  transportFees: 3000,   tuitionFees: 80000,  accreditations: ['NBA', 'NAAC A'] },
  'nit-meghalaya':  { campusArea: '150 acres', totalStudents: 2000, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 42000,  messFees: 22000,  transportFees: 2500,   tuitionFees: 77500,  accreditations: ['NBA', 'NAAC A'] },
  'nit-sikkim':     { campusArea: '35 acres',  totalStudents: 1800, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 40000,  messFees: 21000,  transportFees: 2000,   tuitionFees: 75000,  accreditations: ['NBA', 'NAAC A'] },
  'svnit-surat':    { campusArea: '250 acres', totalStudents: 5500, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 52000,  messFees: 28000,  transportFees: 4000,   tuitionFees: 85000,  accreditations: ['NBA', 'NAAC A+'] },
  // IIITs
  'iiit-hyderabad': { campusArea: '64 acres',  totalStudents: 4000, facultyStudentRatio: '1:10', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 80000,  messFees: 40000,  transportFees: 5000,   tuitionFees: 200000, accreditations: ['NBA', 'NAAC A++'] },
  'iiit-bangalore': { campusArea: '38 acres',  totalStudents: 2500, facultyStudentRatio: '1:11', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 75000,  messFees: 38000,  transportFees: 5000,   tuitionFees: 190000, accreditations: ['NBA', 'NAAC A+'] },
  'iiit-naya-raipur': { campusArea: '150 acres', totalStudents: 2000, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 50000,  messFees: 25000,  transportFees: 3000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A'] },
  'iiit-sri-city':  { campusArea: '125 acres', totalStudents: 1800, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 48000,  messFees: 24000,  transportFees: 3000,   tuitionFees: 125000, accreditations: ['NBA', 'NAAC A'] },
  'iiit-guwahati':  { campusArea: '100 acres', totalStudents: 1600, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 45000,  messFees: 23000,  transportFees: 2500,   tuitionFees: 115000, accreditations: ['NBA', 'NAAC A'] },
  'iiit-allahabad': { campusArea: '125 acres', totalStudents: 3500, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 55000,  messFees: 28000,  transportFees: 3500,   tuitionFees: 130000, accreditations: ['NBA', 'NAAC A+'] },
  'iiitdm-jabalpur': { campusArea: '200 acres', totalStudents: 2800, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 50000,  messFees: 26000,  transportFees: 3000,   tuitionFees: 120000, accreditations: ['NBA', 'NAAC A'] },
  'iiitdm-kancheepuram': { campusArea: '100 acres', totalStudents: 2200, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 48000,  messFees: 25000,  transportFees: 3000, tuitionFees: 115000, accreditations: ['NBA', 'NAAC A'] },
  // Deemed
  'vit-vellore':    { campusArea: '372 acres', totalStudents: 35000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 95000,  messFees: 50000,  transportFees: 8000,   tuitionFees: 175000, accreditations: ['NBA', 'NAAC A++', 'ABET'] },
  'bits-pilani':    { campusArea: '328 acres', totalStudents: 12000, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: true,  hostelFeesPerYear: 110000, messFees: 55000,  transportFees: 6000,   tuitionFees: 250000, accreditations: ['NBA', 'NAAC A++'] },
  'amrita-coimbatore': { campusArea: '450 acres', totalStudents: 18000, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 75000,  messFees: 38000,  transportFees: 5000,   tuitionFees: 160000, accreditations: ['NBA', 'NAAC A++'] },
  'srm-chennai':    { campusArea: '250 acres', totalStudents: 38000, facultyStudentRatio: '1:16', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 85000,  messFees: 42000,  transportFees: 7000,   tuitionFees: 175000, accreditations: ['NBA', 'NAAC A++'] },
  'mit-manipal':    { campusArea: '200 acres', totalStudents: 15000, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 90000,  messFees: 45000,  transportFees: 6000,   tuitionFees: 190000, accreditations: ['NBA', 'NAAC A++'] },
  'kl-ef-vaddeswaram': { campusArea: '100 acres', totalStudents: 12000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 70000,  messFees: 35000,  transportFees: 5000, tuitionFees: 150000, accreditations: ['NBA', 'NAAC A++'] },
  // Private
  'cbit-hyderabad': { campusArea: '48 acres',  totalStudents: 6000, facultyStudentRatio: '1:16', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 45000,  messFees: 22000,  transportFees: 3000,   tuitionFees: 75000,  accreditations: ['NBA', 'NAAC A+'] },
  'vasavi-hyderabad': { campusArea: '16 acres',  totalStudents: 4000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 40000,  messFees: 20000,  transportFees: 2500,   tuitionFees: 70000,  accreditations: ['NBA', 'NAAC A+'] },
  'gpr-ec-kurnool': { campusArea: '60 acres',  totalStudents: 3500, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 38000,  messFees: 18000,  transportFees: 2500,   tuitionFees: 65000,  accreditations: ['NBA', 'NAAC A+'] },
  'rvrjc-guntur':   { campusArea: '30 acres',  totalStudents: 3800, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 36000,  messFees: 17000,  transportFees: 2000,   tuitionFees: 60000,  accreditations: ['NBA', 'NAAC A+'] },
  // State
  'jntuk-kakinada': { campusArea: '110 acres', totalStudents: 8000, facultyStudentRatio: '1:17', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 35000,  messFees: 18000,  transportFees: 3000,   tuitionFees: 55000,  accreditations: ['NBA', 'NAAC A+'] },
  'auce-visakhapatnam': { campusArea: '80 acres', totalStudents: 5000, facultyStudentRatio: '1:16', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 32000,  messFees: 16000,  transportFees: 2500, tuitionFees: 50000,  accreditations: ['NBA', 'NAAC A+'] },
  'svu-tirupati':   { campusArea: '850 acres', totalStudents: 4000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 30000,  messFees: 15000,  transportFees: 2000,   tuitionFees: 45000,  accreditations: ['NBA', 'NAAC A+'] },
  'jntuh-hyderabad': { campusArea: '95 acres',  totalStudents: 7000, facultyStudentRatio: '1:18', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 35000,  messFees: 17000,  transportFees: 3000,   tuitionFees: 50000,  accreditations: ['NBA', 'NAAC A+'] },
  'ouce-hyderabad': { campusArea: '1600 acres', totalStudents: 8000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 28000,  messFees: 15000,  transportFees: 2000,   tuitionFees: 40000,  accreditations: ['NBA', 'NAAC A++'] },
  'uoh-hyderabad':  { campusArea: '2300 acres', totalStudents: 10000, facultyStudentRatio: '1:12', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 25000,  messFees: 14000,  transportFees: 2000,   tuitionFees: 35000,  accreditations: ['NAAC A++'] },
  'dtu-delhi':      { campusArea: '164 acres', totalStudents: 12000, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 60000,  messFees: 30000,  transportFees: 5000,   tuitionFees: 110000, accreditations: ['NBA', 'NAAC A++'] },
  'pec-chandigarh': { campusArea: '120 acres', totalStudents: 5000, facultyStudentRatio: '1:13', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 50000,  messFees: 25000,  transportFees: 4000,   tuitionFees: 75000,  accreditations: ['NBA', 'NAAC A++'] },
  'coep-pune':      { campusArea: '67 acres',  totalStudents: 6000, facultyStudentRatio: '1:15', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 45000,  messFees: 22000,  transportFees: 3500,   tuitionFees: 60000,  accreditations: ['NBA', 'NAAC A+'] },
  'iiests-shibpur': { campusArea: '130 acres', totalStudents: 5500, facultyStudentRatio: '1:14', hostelAvailable: true, hostelCompulsory: false, hostelFeesPerYear: 40000,  messFees: 20000,  transportFees: 3000,   tuitionFees: 70000,  accreditations: ['NBA', 'NAAC A+'] },
};

// ─── Known colleges with rich detail (ratings, fees, placements, etc.) ───
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
    overview: 'IIT Bombay was established in 1958 and is one of the most vibrant campuses in India. Known for its excellent academic programs and strong industry connections.',
    established: 1958,
    website: 'https://www.iitb.ac.in',
    naacGrade: 'A++',
    nirfRank: 3,
    placementAvg: 2300000,
    placementMax: 58000000,
    placementPct: 93,
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
    overview: 'IIT Kanpur was established in 1959. It has an extensive research focus and a sprawling campus with state-of-the-art laboratories and facilities.',
    established: 1959,
    website: 'https://www.iitk.ac.in',
    naacGrade: 'A++',
    nirfRank: 4,
    placementAvg: 2200000,
    placementMax: 55000000,
    placementPct: 92,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Qualcomm', 'Adobe'],
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
    overview: 'IIT Kharagpur is the oldest IIT, established in 1951. It has the largest campus among all IITs and offers a wide range of academic programs.',
    established: 1951,
    website: 'https://www.iitkgp.ac.in',
    naacGrade: 'A++',
    nirfRank: 5,
    placementAvg: 2100000,
    placementMax: 50000000,
    placementPct: 91,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Texas Instruments'],
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
    overview: 'IIT Roorkee is the oldest engineering institution in Asia, established in 1847. It became an IIT in 2001 and continues its legacy of excellence.',
    established: 1847,
    website: 'https://www.iitr.ac.in',
    naacGrade: 'A++',
    nirfRank: 6,
    placementAvg: 2000000,
    placementMax: 48000000,
    placementPct: 90,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Intel', 'HCL'],
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
    overview: 'IIT Guwahati was established in 1994 and has quickly risen to become one of the top engineering institutes in India with excellent infrastructure and faculty.',
    established: 1994,
    website: 'https://www.iitg.ac.in',
    naacGrade: 'A++',
    nirfRank: 7,
    placementAvg: 1900000,
    placementMax: 45000000,
    placementPct: 89,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'JP Morgan'],
  },
  {
    name: 'Indian Institute of Technology Hyderabad',
    slug: 'iit-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.IIT,
    rating: 4.5,
    totalFees: 250000,
    overview: 'IIT Hyderabad was established in 2008. It has rapidly grown to become one of the top IITs with innovative teaching methods and strong research output.',
    established: 2008,
    website: 'https://www.iith.ac.in',
    naacGrade: 'A++',
    nirfRank: 8,
    placementAvg: 2100000,
    placementMax: 42000000,
    placementPct: 88,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
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
    overview: 'IIT (BHU) Varanasi was converted from IT BHU to an IIT in 2012. It has a rich heritage dating back to 1919 and a strong alumni network.',
    established: 1919,
    website: 'https://www.iitbhu.ac.in',
    naacGrade: 'A++',
    nirfRank: 9,
    placementAvg: 1800000,
    placementMax: 40000000,
    placementPct: 87,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'Indian Institute of Technology Bhubaneswar',
    slug: 'iit-bhubaneswar',
    location: 'Bhubaneswar, Odisha',
    city: 'Bhubaneswar',
    state: 'Odisha',
    type: CollegeType.IIT,
    rating: 4.3,
    totalFees: 250000,
    overview: 'IIT Bhubaneswar was established in 2008. It offers a modern curriculum with focus on interdisciplinary research and innovation.',
    established: 2008,
    website: 'https://www.iitbbs.ac.in',
    naacGrade: 'A++',
    nirfRank: 12,
    placementAvg: 1700000,
    placementMax: 35000000,
    placementPct: 85,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Intel', 'Cisco'],
  },
  {
    name: 'Indian Institute of Technology Gandhinagar',
    slug: 'iit-gandhinagar',
    location: 'Gandhinagar, Gujarat',
    city: 'Gandhinagar',
    state: 'Gujarat',
    type: CollegeType.IIT,
    rating: 4.4,
    totalFees: 250000,
    overview: 'IIT Gandhinagar was established in 2008. Known for its innovative curriculum, strong liberal arts integration, and excellent faculty.',
    established: 2008,
    website: 'https://www.iitgn.ac.in',
    naacGrade: 'A++',
    nirfRank: 13,
    placementAvg: 1800000,
    placementMax: 38000000,
    placementPct: 86,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
  },
  {
    name: 'Indian Institute of Technology Jodhpur',
    slug: 'iit-jodhpur',
    location: 'Jodhpur, Rajasthan',
    city: 'Jodhpur',
    state: 'Rajasthan',
    type: CollegeType.IIT,
    rating: 4.2,
    totalFees: 250000,
    overview: 'IIT Jodhpur was established in 2008. It focuses on technology-driven research and has strong industry partnerships for placements.',
    established: 2008,
    website: 'https://www.iitj.ac.in',
    naacGrade: 'A++',
    nirfRank: 15,
    placementAvg: 1600000,
    placementMax: 32000000,
    placementPct: 84,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Infosys'],
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
    overview: 'NIT Trichy was established in 1964 and is consistently ranked as the top NIT in India. It offers excellent engineering programs with strong placement record.',
    established: 1964,
    website: 'https://www.nitt.edu',
    naacGrade: 'A++',
    nirfRank: 10,
    placementAvg: 2200000,
    placementMax: 45000000,
    placementPct: 92,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'National Institute of Technology Surathkal',
    slug: 'nit-surathkal',
    location: 'Mangalore, Karnataka',
    city: 'Mangalore',
    state: 'Karnataka',
    type: CollegeType.NIT,
    rating: 4.4,
    totalFees: 180000,
    overview: 'NIT Surathkal, also known as NITK, was established in 1960. It is one of the top NITs with excellent placements and a beautiful coastal campus.',
    established: 1960,
    website: 'https://www.nitk.ac.in',
    naacGrade: 'A++',
    nirfRank: 14,
    placementAvg: 2000000,
    placementMax: 40000000,
    placementPct: 90,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
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
    overview: 'NIT Warangal was established in 1959 and is one of the oldest and most prestigious NITs in India with excellent academic and research output.',
    established: 1959,
    website: 'https://www.nitw.ac.in',
    naacGrade: 'A++',
    nirfRank: 17,
    placementAvg: 1900000,
    placementMax: 38000000,
    placementPct: 89,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Qualcomm'],
  },
  {
    name: 'National Institute of Technology Rourkela',
    slug: 'nit-rourkela',
    location: 'Rourkela, Odisha',
    city: 'Rourkela',
    state: 'Odisha',
    type: CollegeType.NIT,
    rating: 4.2,
    totalFees: 175000,
    overview: 'NIT Rourkela was established in 1961. It has a sprawling campus with modern infrastructure and a strong focus on research and innovation.',
    established: 1961,
    website: 'https://www.nitrkl.ac.in',
    naacGrade: 'A++',
    nirfRank: 21,
    placementAvg: 1800000,
    placementMax: 35000000,
    placementPct: 88,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Intel', 'TCS'],
  },
  {
    name: 'National Institute of Technology Calicut',
    slug: 'nit-calicut',
    location: 'Calicut, Kerala',
    city: 'Calicut',
    state: 'Kerala',
    type: CollegeType.NIT,
    rating: 4.1,
    totalFees: 175000,
    overview: 'NIT Calicut was established in 1961. It is one of the premier engineering institutions in Kerala with good placement record and campus facilities.',
    established: 1961,
    website: 'https://www.nitc.ac.in',
    naacGrade: 'A++',
    nirfRank: 26,
    placementAvg: 1600000,
    placementMax: 30000000,
    placementPct: 85,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'TCS'],
  },
  {
    name: 'National Institute of Technology Durgapur',
    slug: 'nit-durgapur',
    location: 'Durgapur, West Bengal',
    city: 'Durgapur',
    state: 'West Bengal',
    type: CollegeType.NIT,
    rating: 4.0,
    totalFees: 170000,
    overview: 'NIT Durgapur was established in 1960. It is one of the leading engineering colleges in Eastern India with a strong alumni network and placements.',
    established: 1960,
    website: 'https://www.nitdgp.ac.in',
    naacGrade: 'A+',
    nirfRank: 31,
    placementAvg: 1400000,
    placementMax: 28000000,
    placementPct: 82,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'Cognizant'],
  },
  {
    name: 'Motilal Nehru National Institute of Technology Allahabad',
    slug: 'nit-allahabad',
    location: 'Prayagraj, Uttar Pradesh',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: CollegeType.NIT,
    rating: 4.1,
    totalFees: 170000,
    overview: 'MNNIT Allahabad was established in 1961. It is known for its strong academic programs and excellent placement opportunities in top companies.',
    established: 1961,
    website: 'https://www.mnnit.ac.in',
    naacGrade: 'A+',
    nirfRank: 34,
    placementAvg: 1500000,
    placementMax: 30000000,
    placementPct: 83,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'Wipro'],
  },
  {
    name: 'National Institute of Technology Karnataka',
    slug: 'nit-karnataka',
    location: 'Surathkal, Karnataka',
    city: 'Mangalore',
    state: 'Karnataka',
    type: CollegeType.NIT,
    rating: 4.3,
    totalFees: 180000,
    overview: 'NIT Karnataka (NITK) was established in 1960 and is among the top NITs known for excellent academic standards and a vibrant campus life.',
    established: 1960,
    website: 'https://www.nitk.ac.in',
    naacGrade: 'A++',
    nirfRank: 18,
    placementAvg: 1900000,
    placementMax: 42000000,
    placementPct: 88,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel'],
  },
  {
    name: 'National Institute of Technology Patna',
    slug: 'nit-patna',
    location: 'Patna, Bihar',
    city: 'Patna',
    state: 'Bihar',
    type: CollegeType.NIT,
    rating: 3.9,
    totalFees: 165000,
    overview: 'NIT Patna was established in 1886 as the Bihar College of Engineering and converted to NIT in 2004. It has a rich history and good placement record.',
    established: 1886,
    website: 'https://www.nitp.ac.in',
    naacGrade: 'A+',
    nirfRank: 43,
    placementAvg: 1200000,
    placementMax: 25000000,
    placementPct: 78,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
  {
    name: 'National Institute of Technology Silchar',
    slug: 'nit-silchar',
    location: 'Silchar, Assam',
    city: 'Silchar',
    state: 'Assam',
    type: CollegeType.NIT,
    rating: 3.8,
    totalFees: 160000,
    overview: 'NIT Silchar was established in 1967. It is one of the leading technical institutes in Northeast India with growing placement opportunities.',
    established: 1967,
    website: 'https://www.nits.ac.in',
    naacGrade: 'A+',
    nirfRank: 48,
    placementAvg: 1000000,
    placementMax: 22000000,
    placementPct: 75,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
  {
    name: 'National Institute of Technology Hamirpur',
    slug: 'nit-hamirpur',
    location: 'Hamirpur, Himachal Pradesh',
    city: 'Hamirpur',
    state: 'Himachal Pradesh',
    type: CollegeType.NIT,
    rating: 3.8,
    totalFees: 160000,
    overview: 'NIT Hamirpur was established in 1986. It offers quality technical education in the scenic surroundings of Himachal Pradesh with decent placement support.',
    established: 1986,
    website: 'https://www.nith.ac.in',
    naacGrade: 'A',
    nirfRank: 53,
    placementAvg: 900000,
    placementMax: 20000000,
    placementPct: 72,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture'],
  },
  {
    name: 'National Institute of Technology Meghalaya',
    slug: 'nit-meghalaya',
    location: 'Shillong, Meghalaya',
    city: 'Shillong',
    state: 'Meghalaya',
    type: CollegeType.NIT,
    rating: 3.6,
    totalFees: 155000,
    overview: 'NIT Meghalaya was established in 2010. It is one of the newer NITs with modern curriculum and focus on holistic student development.',
    established: 2010,
    website: 'https://www.nitmeghalaya.ac.in',
    naacGrade: 'A',
    nirfRank: 65,
    placementAvg: 700000,
    placementMax: 15000000,
    placementPct: 65,
    topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'National Institute of Technology Sikkim',
    slug: 'nit-sikkim',
    location: 'Ravangla, Sikkim',
    city: 'Ravangla',
    state: 'Sikkim',
    type: CollegeType.NIT,
    rating: 3.5,
    totalFees: 150000,
    overview: 'NIT Sikkim was established in 2010. It is a young institute with modern teaching methods and a focus on research and innovation in a serene environment.',
    established: 2010,
    website: 'https://www.nitsikkim.ac.in',
    naacGrade: 'A',
    nirfRank: 70,
    placementAvg: 600000,
    placementMax: 12000000,
    placementPct: 60,
    topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'Sardar Vallabhbhai National Institute of Technology, Surat',
    slug: 'svnit-surat',
    location: 'Surat, Gujarat',
    city: 'Surat',
    state: 'Gujarat',
    type: CollegeType.NIT,
    rating: 4.0,
    totalFees: 170000,
    overview: 'SVNIT Surat was established in 1961. It is one of the premier NITs with excellent infrastructure and strong placement record in Gujarat.',
    established: 1961,
    website: 'https://www.svnit.ac.in',
    naacGrade: 'A+',
    nirfRank: 36,
    placementAvg: 1400000,
    placementMax: 28000000,
    placementPct: 82,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'L&T'],
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
    overview: 'IIIT Hyderabad was established in 1998. It is a premier research institute known for its strong computer science programs and entrepreneurial culture.',
    established: 1998,
    website: 'https://www.iiit.ac.in',
    naacGrade: 'A++',
    nirfRank: 19,
    placementAvg: 2800000,
    placementMax: 55000000,
    placementPct: 95,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Uber'],
  },
  {
    name: 'International Institute of Information Technology Bangalore',
    slug: 'iiit-bangalore',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    type: CollegeType.IIIT,
    rating: 4.3,
    totalFees: 380000,
    overview: 'IIIT Bangalore was established in 1999. It is known for its industry-focused curriculum and excellent placement record in top tech companies.',
    established: 1999,
    website: 'https://www.iiitb.ac.in',
    naacGrade: 'A+',
    nirfRank: 27,
    placementAvg: 2500000,
    placementMax: 48000000,
    placementPct: 93,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Flipkart'],
  },
  {
    name: 'International Institute of Information Technology Naya Raipur',
    slug: 'iiit-naya-raipur',
    location: 'Naya Raipur, Chhattisgarh',
    city: 'Naya Raipur',
    state: 'Chhattisgarh',
    type: CollegeType.IIIT,
    rating: 3.8,
    totalFees: 250000,
    overview: 'IIIT Naya Raipur was established in 2013. It is a relatively young institute with modern infrastructure and a focus on information technology education.',
    established: 2013,
    website: 'https://www.iiitnr.ac.in',
    naacGrade: 'A',
    nirfRank: 55,
    placementAvg: 1200000,
    placementMax: 25000000,
    placementPct: 78,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Capgemini'],
  },
  {
    name: 'Indian Institute of Information Technology Sri City',
    slug: 'iiit-sri-city',
    location: 'Sri City, Andhra Pradesh',
    city: 'Sri City',
    state: 'Andhra Pradesh',
    type: CollegeType.IIIT,
    rating: 3.7,
    totalFees: 250000,
    overview: 'IIIT Sri City was established in 2013. It offers specialized IT programs with a focus on research and industry collaboration in Andhra Pradesh.',
    established: 2013,
    website: 'https://www.iiitsricity.ac.in',
    naacGrade: 'A',
    nirfRank: 60,
    placementAvg: 1100000,
    placementMax: 22000000,
    placementPct: 75,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
  {
    name: 'Indian Institute of Information Technology Guwahati',
    slug: 'iiit-guwahati',
    location: 'Guwahati, Assam',
    city: 'Guwahati',
    state: 'Assam',
    type: CollegeType.IIIT,
    rating: 3.6,
    totalFees: 230000,
    overview: 'IIIT Guwahati was established in 2013. It is a young institute with modern infrastructure and growing placement opportunities in Northeast India.',
    established: 2013,
    website: 'https://www.iiitg.ac.in',
    naacGrade: 'A',
    nirfRank: 62,
    placementAvg: 1000000,
    placementMax: 20000000,
    placementPct: 72,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
  {
    name: 'IIIT Allahabad',
    slug: 'iiit-allahabad',
    location: 'Prayagraj, Uttar Pradesh',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: CollegeType.IIIT,
    rating: 4.1,
    totalFees: 260000,
    overview: 'IIIT Allahabad was established in 1999. It is a premier institute for information technology education with a strong focus on research and innovation.',
    established: 1999,
    website: 'https://www.iiita.ac.in',
    naacGrade: 'A+',
    nirfRank: 32,
    placementAvg: 1800000,
    placementMax: 35000000,
    placementPct: 85,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Flipkart'],
  },
  {
    name: 'IIITDM Jabalpur',
    slug: 'iiitdm-jabalpur',
    location: 'Jabalpur, Madhya Pradesh',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    type: CollegeType.IIIT,
    rating: 3.9,
    totalFees: 240000,
    overview: 'IIITDM Jabalpur was established in 2005. It focuses on design and manufacturing with IT integration, offering unique interdisciplinary programs.',
    established: 2005,
    website: 'https://www.iiitdmj.ac.in',
    naacGrade: 'A',
    nirfRank: 45,
    placementAvg: 1300000,
    placementMax: 26000000,
    placementPct: 78,
    topRecruiters: ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'Wipro'],
  },
  {
    name: 'IIITDM Kancheepuram',
    slug: 'iiitdm-kancheepuram',
    location: 'Kancheepuram, Tamil Nadu',
    city: 'Kancheepuram',
    state: 'Tamil Nadu',
    type: CollegeType.IIIT,
    rating: 3.7,
    totalFees: 230000,
    overview: 'IIITDM Kancheepuram was established in 2007. It offers undergraduate and postgraduate programs with a focus on design and manufacturing.',
    established: 2007,
    website: 'https://www.iiitdm.ac.in',
    naacGrade: 'A',
    nirfRank: 55,
    placementAvg: 1000000,
    placementMax: 20000000,
    placementPct: 72,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
  {
    name: 'Vellore Institute of Technology',
    slug: 'vit-vellore',
    location: 'Vellore, Tamil Nadu',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: CollegeType.DEEMED,
    rating: 4.2,
    totalFees: 350000,
    overview: 'VIT Vellore was established in 1984. It is one of the largest private engineering universities in India with excellent infrastructure and global collaborations.',
    established: 1984,
    website: 'https://www.vit.ac.in',
    naacGrade: 'A++',
    nirfRank: 16,
    placementAvg: 2400000,
    placementMax: 45000000,
    placementPct: 93,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
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
    overview: 'BITS Pilani was established in 1964. It is one of the most prestigious private engineering institutions in India with a strong alumni network and industry connections.',
    established: 1964,
    website: 'https://www.bits-pilani.ac.in',
    naacGrade: 'A++',
    nirfRank: 23,
    placementAvg: 3000000,
    placementMax: 55000000,
    placementPct: 95,
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
  {
    name: 'Jawaharlal Nehru Technological University Hyderabad',
    slug: 'jntuh-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 3.8,
    totalFees: 100000,
    overview: 'JNTU Hyderabad was established in 1972 and is one of the premier engineering universities in Telangana with a wide range of engineering programs and strong industry connections.',
    established: 1972,
    website: 'https://www.jntuh.ac.in',
    naacGrade: 'A+',
    nirfRank: 40,
    placementAvg: 800000,
    placementMax: 18000000,
    placementPct: 72,
    topRecruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    name: 'Osmania University College of Engineering',
    slug: 'ouce-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 4.0,
    totalFees: 80000,
    overview: 'OUCE was established in 1929 and is one of the oldest and most prestigious engineering colleges in Hyderabad with a strong academic legacy.',
    established: 1929,
    website: 'https://www.osmania.ac.in',
    naacGrade: 'A++',
    nirfRank: 28,
    placementAvg: 900000,
    placementMax: 20000000,
    placementPct: 75,
    topRecruiters: ['Infosys', 'TCS', 'Google', 'Microsoft', 'Amazon'],
  },
  {
    name: 'University of Hyderabad',
    slug: 'uoh-hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: CollegeType.STATE,
    rating: 4.0,
    totalFees: 70000,
    overview: 'University of Hyderabad is a central university established in 1974 with excellent academic programs and research output across disciplines.',
    established: 1974,
    website: 'https://www.uohyd.ac.in',
    naacGrade: 'A++',
    nirfRank: 11,
    placementAvg: 1200000,
    placementMax: 25000000,
    placementPct: 75,
    topRecruiters: ['Google', 'Amazon', 'Microsoft', 'Infosys', 'TCS'],
  },
  {
    name: 'Delhi Technological University',
    slug: 'dtu-delhi',
    location: 'New Delhi, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: CollegeType.STATE,
    rating: 4.2,
    totalFees: 220000,
    overview: 'DTU was established in 1941 and is one of the premier engineering universities in Delhi with excellent placement record and industry connections.',
    established: 1941,
    website: 'https://www.dtu.ac.in',
    naacGrade: 'A++',
    nirfRank: 25,
    placementAvg: 2200000,
    placementMax: 48000000,
    placementPct: 90,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Flipkart'],
  },
  {
    name: 'Punjab Engineering College',
    slug: 'pec-chandigarh',
    location: 'Chandigarh, Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: CollegeType.STATE,
    rating: 4.1,
    totalFees: 150000,
    overview: 'PEC Chandigarh was established in 1921 and is one of the oldest engineering institutions in India with a strong placement record and alumni network.',
    established: 1921,
    website: 'https://www.pec.ac.in',
    naacGrade: 'A++',
    nirfRank: 33,
    placementAvg: 1800000,
    placementMax: 35000000,
    placementPct: 88,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Adobe'],
  },
  {
    name: 'College of Engineering Pune',
    slug: 'coep-pune',
    location: 'Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    type: CollegeType.STATE,
    rating: 4.1,
    totalFees: 120000,
    overview: 'COEP was established in 1854 and is one of the oldest engineering colleges in Asia with a strong academic reputation and excellent placement opportunities.',
    established: 1854,
    website: 'https://www.coep.org.in',
    naacGrade: 'A+',
    nirfRank: 37,
    placementAvg: 1500000,
    placementMax: 30000000,
    placementPct: 85,
    topRecruiters: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'TCS'],
  },
  {
    name: 'Indian Institute of Engineering Science and Technology Shibpur',
    slug: 'iiests-shibpur',
    location: 'Shibpur, West Bengal',
    city: 'Shibpur',
    state: 'West Bengal',
    type: CollegeType.IIIT,
    rating: 4.0,
    totalFees: 140000,
    overview: 'IIEST Shibpur was established in 1856 and is one of the oldest engineering institutions in India. It became an IIEST in 2014.',
    established: 1856,
    website: 'https://www.iiests.ac.in',
    naacGrade: 'A+',
    nirfRank: 39,
    placementAvg: 1300000,
    placementMax: 28000000,
    placementPct: 80,
    topRecruiters: ['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant'],
  },
];

// ─── Helper to create a normalized slug from a college name ───
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

// ─── Cache of DB colleges (slug → slug) for fast lookup ───
let dbSlugs: Set<string> = new Set();

async function refreshDbSlugs() {
  const all = await prisma.college.findMany({ select: { id: true, slug: true, name: true } });
  dbSlugs = new Set(all.map(c => c.slug));
  return all;
}

// ─── Fuzzy-match a dataset college name against known DB names ───
function fuzzyFindSlug(datasetName: string, nameToSlugMap: Map<string, string>): string | undefined {
  const norm = datasetName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  for (const [dbName, dbSlug] of nameToSlugMap) {
    const normDb = dbName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (norm.includes(normDb) || normDb.includes(norm)) return dbSlug;
  }
  return undefined;
}

// ─── Ensure a college exists in DB, creating it with auto-slug if needed ───
async function ensureCollege(
  datasetName: string,
  type: CollegeType,
  nameToSlugMap: Map<string, string>,  // known name→slug
): Promise<string | undefined> {
  // 1. Try fuzzy match against known colleges
  const fuzzySlug = fuzzyFindSlug(datasetName, nameToSlugMap);
  if (fuzzySlug) return fuzzySlug;

  // 2. Generate a slug from dataset name
  const slug = nameToSlug(datasetName);
  if (dbSlugs.has(slug)) return slug;

  // 3. Slice off trailing location-like suffixes for a cleaner name
  const cleanName = datasetName.replace(/\,?\s*(?:Campus|Autonomous|AUTONOMOUS|GHATKESAR|HYDERABAD|HAYATHNAGAR|NARSAPUR|NARSAMPET|IBRAHIMPATNAM|SAIDABAD|YENKAPALLY|KHAMMAM|PALONCHA|KODAD|BATASINGARAM|MANCHERIAL|KOTHAGUDEM|MOINABAD|BOYS)\s*$/i, '').trim();

  // 4. Create the college
  const locationParts = datasetName.split(/\s+(?:HYDERABAD|GHATKESAR|KOTHAGUDEM|NARSAPUR|NARSAMPET|IBRAHIMPATNAM|SAIDABAD|YENKAPALLY|KHAMMAM|PALONCHA|KODAD|BATASINGARAM|MANCHERIAL|MOINABAD|TIRUPATI|VISAKHAPATNAM)\s*/i);
  const lastPart = locationParts.length > 1 ? locationParts[locationParts.length - 1] : undefined;
  const location = lastPart ? lastPart.trim() + ', Telangana' : 'Hyderabad, Telangana';

  try {
    await prisma.college.create({
      data: {
        name: cleanName,
        slug,
        location: location,
        city: location.split(',')[0]?.trim() || 'Hyderabad',
        state: 'Telangana',
        type,
        rating: 3.0,
        totalFees: 100000,
        overview: `${cleanName} is an engineering college offering undergraduate and postgraduate programs.`,
        established: 2000,
        website: null,
        naacGrade: null,
        nirfRank: null,
        placementAvg: null,
        placementMax: null,
        placementPct: null,
        topRecruiters: [],
        campusArea: '10+ acres',
        totalStudents: 1000,
        facultyStudentRatio: '1:20',
        accreditations: ['NAAC'],
        hostelAvailable: true,
        hostelCompulsory: false,
        hostelFeesPerYear: 60000,
        messFees: 30000,
        tuitionFees: 100000,
      },
    });
    dbSlugs.add(slug);
    console.log(`  [auto-created] ${slug} → ${cleanName}`);
    return slug;
  } catch (e: any) {
    if (e.code === 'P2002') {
      // Unique constraint violation - someone else created it concurrently
      dbSlugs.add(slug);
      return slug;
    }
    console.error(`  [FAILED] to create college for "${datasetName}": ${e.message}`);
    return undefined;
  }
}

type CutoffInput = {
  collegeSlug: string;
  exam: ExamType;
  category: Category;
  rankMin: number;
  rankMax: number;
  year: number;
  branch: string | null;
};

// ─── Load JEE Advanced cutoffs from JoSAA XLSX ───
function loadJeeAdvancedCutoffs(
  nameToSlug: Map<string, string>,
  dataPath: string,
): CutoffInput[] {
  const xlsx = require('xlsx');
  const wb = xlsx.readFile(dataPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, string>[] = xlsx.utils.sheet_to_json(ws);

  const seatToCat: Record<string, Category> = {
    'OPEN': Category.GENERAL,
    'EWS': Category.EWS,
    'OBC-NCL': Category.OBC,
    'SC': Category.SC,
    'ST': Category.ST,
  };

  const cutoffs: CutoffInput[] = [];
  for (const row of rows) {
    const institute = (row.Institute || row.institute || '').toString().trim();
    if (!institute) continue;
    const slug = nameToSlug.get(institute);
    if (!slug) continue;
    const cat = seatToCat[row['Seat Type'] || ''];
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

// ─── Load JEE Mains NIT cutoffs ───
function loadJeeMainsNitsCutoffs(
  nameToSlug: Map<string, string>,
  csvPath: string,
): CutoffInput[] {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const rows: Record<string, string>[] = parse(raw, { columns: true, skip_empty_lines: true });
  const rows2024 = rows.filter((r) => String(r.Year) === '2024');

  const catMap: Record<string, Category> = {
    General: Category.GENERAL,
    'OBC-NCL': Category.OBC,
    SC: Category.SC,
    ST: Category.ST,
    EWS: Category.EWS,
  };

  const cutoffs: CutoffInput[] = [];
  for (const row of rows2024) {
    const institute = (row.Institute || row.institute || '').toString().trim();
    if (!institute) continue;
    const slug = nameToSlug.get(institute);
    if (!slug) continue;
    const categoryRaw = row.Category;
    if (!categoryRaw) continue;
    const cat = catMap[categoryRaw];
    if (!cat) continue;
    const openRankRaw = row.Opening_Rank;
    const closeRankRaw = row.Closing_Rank;
    if (!openRankRaw || !closeRankRaw) continue;
    const openRank = parseInt(openRankRaw);
    const closeRank = parseInt(closeRankRaw);
    if (isNaN(openRank) || isNaN(closeRank)) continue;
    cutoffs.push({
      collegeSlug: slug,
      exam: ExamType.JEE_MAINS,
      category: cat,
      rankMin: Math.min(openRank, closeRank),
      rankMax: Math.max(openRank, closeRank),
      year: 2024,
      branch: row.Branch ?? null,
    });
  }
  return cutoffs;
}

// ─── Load EAMCET cutoffs ───
function loadEamcetCutoffs(
  nameToSlug: Map<string, string>,
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

  const makeKey = (r: Record<string, string>) =>
    `${r['College Name']}|||${r['Branch Name']}`;

  const p1Map = new Map<string, Record<string, string>>();
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

  const cutoffs: CutoffInput[] = [];
  for (const p3Row of p3Rows) {
    const collegeName = p3Row['College Name'];
    if (!collegeName) continue;
    const slug = nameToSlug.get(collegeName);
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
        branch: p3Row['Branch Name'] ?? null,
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

// ─── Build a name→slug map from the known colleges, then ensure missing ones ───
async function buildNameToSlugMap(
  datasetNames: string[],
  type: CollegeType,
  explicitMaps: [string, string][],  // explicit [datasetName, slug] overrides
  knownNameToSlug: Map<string, string>,  // from collegesData
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  // Add explicit maps first (highest priority)
  for (const [datasetName, slug] of explicitMaps) {
    // Ensure the target college exists (it should for known colleges)
    map.set(datasetName, slug);
  }

  // Try to resolve remaining names
  for (const name of datasetNames) {
    if (map.has(name)) continue;

    // Try to find or create
    const slug = await ensureCollege(name, type, knownNameToSlug);
    if (slug) {
      map.set(name, slug);
    }
  }

  return map;
}
// ─── Determine college type from name ───
function detectType(name: string): CollegeType {
  const upper = name.toUpperCase();
  if (upper.includes('INDIAN INSTITUTE OF TECHNOLOGY') || name.startsWith('IIT')) return CollegeType.IIT;
  if (upper.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || name.startsWith('NIT')) return CollegeType.NIT;
  if (upper.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY') || upper.includes('IIIT')) return CollegeType.IIIT;
  if (upper.includes('IIEST')) return CollegeType.IIIT;
  if (upper.includes('SCHOOL OF PLANNING')) return CollegeType.PRIVATE;
  if (upper.includes('GURU GHASIDAS') || upper.includes('TEZPUR') || upper.includes('ASSAM UNIVERSITY') || upper.includes('CENTRAL UNIVERSITY') || upper.includes('DIBRUGARH') || upper.includes('MIZORAM') || upper.includes('GAUHATI') || upper.includes('JAWAHARLAL NEHRU UNIVERSITY') || upper.includes('PUDUCHERRY')) return CollegeType.PRIVATE;
  return CollegeType.PRIVATE;
}

// ─── Main seed function ───
async function main() {
  console.log('Seeding database...\n');

  // Step 1: Upsert all known colleges (the 54 detailed ones)
  for (const college of collegesData) {
    const extra = extraCollegeData[college.slug];
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
        campusArea: extra?.campusArea ?? null,
        totalStudents: extra?.totalStudents ?? null,
        facultyStudentRatio: extra?.facultyStudentRatio ?? null,
        hostelAvailable: extra?.hostelAvailable ?? false,
        hostelCompulsory: extra?.hostelCompulsory ?? false,
        hostelFeesPerYear: extra?.hostelFeesPerYear ?? null,
        messFees: extra?.messFees ?? null,
        transportFees: extra?.transportFees ?? null,
        tuitionFees: extra?.tuitionFees ?? null,
        accreditations: extra?.accreditations ?? [],
      },
    });
  }
  console.log(`Upserted ${collegesData.length} known colleges`);

  // Refresh DB slug cache
  const allColleges = await refreshDbSlugs();
  console.log(`Total colleges in DB: ${allColleges.length}`);

  // Build known name→slug map from our detailed list
  const knownNameToSlug = new Map<string, string>();
  for (const c of allColleges) {
    knownNameToSlug.set(c.name, c.slug);
  }

  // Step 2: Create courses for all known colleges
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

  for (const college of allColleges) {
    const collegeId = slugToId.get(college.slug);
    if (!collegeId) continue;
    const existingCourses = await prisma.course.findMany({ where: { collegeId } });
    if (existingCourses.length > 0) continue; // already have courses
    const collegeData = collegesData.find(c => c.slug === college.slug);
    const nCourses = collegeData?.type === CollegeType.IIT ? 7 : collegeData?.type === CollegeType.NIT ? 6 : 5;
    const seedCourses = [];
    for (let i = 0; i < nCourses; i++) {
      const branch = branches[i % branches.length]!;
      seedCourses.push({
        collegeId,
        name: branch,
        duration: 4,
        fees: collegeData?.totalFees ?? 100000,
        seats: Math.floor(Math.random() * 90) + 30,
      });
    }
    if (seedCourses.length > 0) {
      await prisma.course.createMany({ data: seedCourses });
    }
  }
  console.log('Seeded courses for all colleges');

  const dataDir = path.join(__dirname, 'data');
  const allCutoffs: CutoffInput[] = [];

  // ═══════════════════════════════════════════════════════════════
  // DATASET 1: JEE Advanced (JoSAA XLSX)
  // ═══════════════════════════════════════════════════════════════
  const round5Path = path.join(dataDir, '2024Round5.xlsx');
  if (fs.existsSync(round5Path)) {
    console.log('\n--- JEE Advanced ---');
    const xlsx = require('xlsx');
    const wb = xlsx.readFile(round5Path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, string>[] = xlsx.utils.sheet_to_json(ws);

    // Collect all unique institute names
    const instNames = new Set<string>();
    for (const row of rows) {
      const inst = (row.Institute || row.institute || '').toString().trim();
      if (inst && !inst.startsWith('This site')) instNames.add(inst);
    }
    console.log(`Found ${instNames.size} unique institutes in JoSAA data`);

    // Build name→slug map with auto-creation
    const jeeNameToSlug = new Map<string, string>();
    for (const name of instNames) {
      const type = detectType(name);
      const slug = await ensureCollege(name, type, knownNameToSlug);
      if (slug) jeeNameToSlug.set(name, slug);
    }
    console.log(`Mapped ${jeeNameToSlug.size}/${instNames.size} JEE Advanced institutes`);

    const jeeAdvCutoffs = loadJeeAdvancedCutoffs(jeeNameToSlug, round5Path);
    allCutoffs.push(...jeeAdvCutoffs);
    console.log(`Loaded ${jeeAdvCutoffs.length} JEE Advanced cutoffs`);
  } else {
    console.warn(`Round5 xlsx not found at ${round5Path}, skipping JEE Advanced cutoffs`);
  }

  // ═══════════════════════════════════════════════════════════════
  // DATASET 2: JEE Mains NIT CSV
  // ═══════════════════════════════════════════════════════════════
  const nitsCsvPath = path.join(dataDir, 'jee_college_cutoffs_nits.csv');
  if (fs.existsSync(nitsCsvPath)) {
    console.log('\n--- JEE Mains NIT ---');
    const raw = fs.readFileSync(nitsCsvPath, 'utf-8');
    const rows: Record<string, string>[] = parse(raw, { columns: true, skip_empty_lines: true });

    // Collect unique institute names
    const nitNames = new Set<string>();
    for (const row of rows) {
      const inst = (row.Institute || row.institute || '').toString().trim();
      if (inst) nitNames.add(inst);
    }
    console.log(`Found ${nitNames.size} unique institutes in NIT CSV`);

    // Build name→slug map with auto-creation for NIT CSV names like "NIT Trichy"
    const nitNameToSlug = new Map<string, string>();

    // First, add known NIT mappings
    const nitExplicitMaps: [string, string][] = [
      ['NIT Trichy', 'nit-tiruchirappalli'],
      ['NIT Surathkal', 'nit-surathkal'],
      ['NIT Warangal', 'nit-warangal'],
      ['NIT Rourkela', 'nit-rourkela'],
      ['MNNIT Allahabad', 'nit-allahabad'],
      ['NIT Calicut', 'nit-calicut'],
      ['NIT Durgapur', 'nit-durgapur'],
      ['NIT Jaipur', 'nit-jaipur'],
      ['NIT Kurukshetra', 'nit-kurukshetra'],
      ['NIT Nagpur', 'nit-nagpur'],
    ];
    for (const [name, slug] of nitExplicitMaps) {
      // Ensure the slug exists in known or auto-create
      if (!dbSlugs.has(slug)) {
        const known = allColleges.find(c => c.slug === slug);
        if (!known) {
          console.log(`  [WARN] Known NIT slug ${slug} not in DB — skipping explicit map "${name}"`);
          continue;
        }
      }
      nitNameToSlug.set(name, slug);
    }

    // For unmatched, try fuzzy against known, then auto-create
    for (const name of nitNames) {
      if (nitNameToSlug.has(name)) continue;
      const slug = await ensureCollege(name, CollegeType.NIT, knownNameToSlug);
      if (slug) nitNameToSlug.set(name, slug);
    }
    console.log(`Mapped ${nitNameToSlug.size}/${nitNames.size} NIT CSV institutes`);

    const nitsCutoffs = loadJeeMainsNitsCutoffs(nitNameToSlug, nitsCsvPath);
    allCutoffs.push(...nitsCutoffs);
    console.log(`Loaded ${nitsCutoffs.length} JEE Mains NIT cutoffs`);
  } else {
    console.warn(`NIT CSV not found at ${nitsCsvPath}, skipping`);
  }

  // ═══════════════════════════════════════════════════════════════
  // DATASET 3: TS EAMCET
  // ═══════════════════════════════════════════════════════════════
  const tsP1Path = path.join(dataDir, 'EAMCET_2024_Phase_1_Cutoffs.csv');
  const tsP3Path = path.join(dataDir, 'EAMCET_2024_Phase_3_Cutoffs.csv');
  if (fs.existsSync(tsP1Path) && fs.existsSync(tsP3Path)) {
    console.log('\n--- TS EAMCET ---');

    // Collect all unique college names from EAMCET data
    const p3Data = parse(fs.readFileSync(tsP3Path, 'utf-8'), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    const eamcetNames = new Set<string>();
    for (const row of p3Data) {
      const name = row['College Name'];
      if (name) eamcetNames.add(name.trim());
    }

    // Filter out disclaimer rows
    const realNames = [...eamcetNames].filter(n =>
      !n.startsWith('1.') && !n.startsWith('2.') && !n.startsWith('3.') &&
      !n.startsWith('4.') && !n.startsWith('5.') && !n.startsWith('6.') &&
      !n.startsWith('7.') && !n.startsWith('8.')
    );
    // Remove the disclaimer rows
    const skipPatterns = [
      'Last rank statement does not reflect', 'Every care has been taken',
      'The Ranks shown are at the end', 'The statement shall be used only',
      'The ranks indicated inclusive', 'The TGCHE/DTE is not responsible',
      'Girls are also eligible', 'In terms of G.O.Ms.No.',
      'NA means Not Applicable',
    ];
    const filteredNames = realNames.filter(n => !skipPatterns.some(p => n.startsWith(p)));
    console.log(`Found ${filteredNames.length} unique colleges in EAMCET data`);

    // Build explicit EAMCET overrides first
    const eamcetExplicit: [string, string][] = [
      ['JNTUH UNIVERSITY COLLEGE OF ENGG SCI AND TECH HYDERABAD', 'jntuh-hyderabad'],
      ['O U COLLEGE OF ENGG  HYDERABAD', 'ouce-hyderabad'],
      ['CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY', 'cbit-hyderabad'],
      ['VASAVI COLLEGE OF ENGINEERING', 'vasavi-hyderabad'],
      ['G. PULLA REDDY ENGINEERING COLLEGE', 'gpr-ec-kurnool'],
      ['RVR & JC COLLEGE OF ENGINEERING', 'rvrjc-guntur'],
      ['VISHNU INSTITUTE OF TECHNOLOGY', 'vishnu-bhimavaram'],
      ['SRI VENKATESWARA UNIVERSITY COLLEGE OF ENGG', 'svu-tirupati'],
      ['ANURAG UNIVERSITY FORMERLY ANURAG GRP OF INSTNS CVSR COLL OF ENGG GHATKESAR', 'cvsr-ghatkesar'],
      ['ANURAG ENGINEERING COLLEGE AUTONOMOUS', 'anurag-kodad'],
    ] as const;

    // Build EAMCET name→slug map with auto-creation
    const eamcetNameToSlug = new Map<string, string>();
    for (const entry of eamcetExplicit) {
      const name = entry[0];
      const slug = entry[1];
      if (dbSlugs.has(slug)) {
        eamcetNameToSlug.set(name, slug);
      } else {
        console.log(`  [skipping explicit map] ${name} → ${slug} not in DB`);
      }
    }

    // Try fuzzy match first, then auto-create
    for (const name of filteredNames) {
      if (eamcetNameToSlug.has(name)) continue;
      const slug = await ensureCollege(name, CollegeType.PRIVATE, knownNameToSlug);
      if (slug) eamcetNameToSlug.set(name, slug);
    }
    console.log(`Mapped ${eamcetNameToSlug.size}/${filteredNames.length} EAMCET colleges`);

    const tsCutoffs = loadEamcetCutoffs(eamcetNameToSlug, tsP1Path, tsP3Path, ExamType.EAMCET_TS);
    allCutoffs.push(...tsCutoffs);
    console.log(`Loaded ${tsCutoffs.length} TS EAMCET cutoffs`);
  } else {
    console.warn('TS EAMCET phase CSVs not found, skipping');
  }

  // ═══════════════════════════════════════════════════════════════
  // Insert all cutoffs
  // ═══════════════════════════════════════════════════════════════
  console.log(`\nTotal cutoffs to insert: ${allCutoffs.length}`);

  // Refresh college IDs
  const freshColleges = await prisma.college.findMany();
  const freshSlugToId = new Map(freshColleges.map((c) => [c.slug, c.id]));

  // Clear existing cutoffs first (for idempotency)
  await prisma.collegeCutoff.deleteMany({});

  // Bulk insert all cutoffs
  const cutoffData = allCutoffs
    .filter(c => freshSlugToId.has(c.collegeSlug))
    .map(c => ({
      collegeId: freshSlugToId.get(c.collegeSlug)!,
      exam: c.exam,
      category: c.category,
      rankMin: c.rankMin,
      rankMax: c.rankMax,
      year: c.year,
      branch: c.branch ?? null,
    }));
  await prisma.collegeCutoff.createMany({ data: cutoffData });
  console.log(`Inserted ${cutoffData.length} cutoff records (${allCutoffs.length - cutoffData.length} skipped due to missing college)`);

  // Step 4: Bulk insert reviews
  const reviewData = reviewsData
    .filter(r => freshSlugToId.has(r.collegeSlug))
    .map(r => ({
      collegeId: freshSlugToId.get(r.collegeSlug)!,
      author: r.author,
      rating: r.rating,
      body: r.body,
      category: r.category,
    }));
  await prisma.review.createMany({ data: reviewData });
  console.log(`Seeded ${reviewData.length} reviews`);

  // Step 5: Update FTS vectors
  await prisma.$executeRawUnsafe(`
    UPDATE "College" SET search_vector =
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(state, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(type::text, '')), 'C')
  `);
  console.log('Updated FTS search vectors');

  // Step 6: Final summary
  const finalColleges = await prisma.college.count();
  const finalCutoffs = await prisma.collegeCutoff.count();
  const finalCourses = await prisma.course.count();
  const finalReviews = await prisma.review.count();
  console.log('\n=== Seed Summary ===');
  console.log(`Colleges: ${finalColleges}`);
  console.log(`Cutoffs: ${finalCutoffs}`);
  console.log(`Courses: ${finalCourses}`);
  console.log(`Reviews: ${finalReviews}`);
  console.log('Seeding complete!');
}

main()
  .catch((e: unknown) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());