import AsyncStorage from '@react-native-async-storage/async-storage';

// Enums for business and funding types
export enum BusinessStructure {
  SOLE_PROPRIETOR = 'sole_proprietor',
  LLC = 'llc',
  C_CORP = 'c_corp',
  S_CORP = 's_corp',
  PARTNERSHIP = 'partnership',
  NOT_REGISTERED = 'not_registered'
}

export enum FundingType {
  GENERAL_BUSINESS = 'general_business',
  EMERGENCY_RELIEF = 'emergency_relief'
}

export enum FundingNeed {
  MARKETING = 'marketing',
  FILING_FEES = 'filing_fees',
  EQUIPMENT = 'equipment',
  STUDIO_TIME = 'studio_time',
  LEGAL_SERVICES = 'legal_services',
  WEBSITE_DEVELOPMENT = 'website_development',
  BUSINESS_REGISTRATION = 'business_registration',
  COPYRIGHT_REGISTRATION = 'copyright_registration',
  TRADEMARK_REGISTRATION = 'trademark_registration',
  OTHER = 'other'
}

export enum MusicRightsStatus {
  ASCAP_MEMBER = 'ascap_member',
  BMI_MEMBER = 'bmi_member',
  SESAC_MEMBER = 'sesac_member',
  TRAP_CHAIN_INTERESTED = 'trap_chain_interested',
  NOT_REGISTERED = 'not_registered'
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  DENIED = 'denied',
  FUNDED = 'funded'
}

export enum EmergencyType {
  LA_FIRES = 'la_fires',
  NATURAL_DISASTER = 'natural_disaster',
  PANDEMIC_IMPACT = 'pandemic_impact',
  MEDICAL_EMERGENCY = 'medical_emergency',
  OTHER = 'other'
}

// Interfaces
export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
  date_of_birth: string;
  social_media: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
  };
}

export interface BusinessInformation {
  business_name?: string;
  business_structure: BusinessStructure;
  ein?: string;
  business_registration_date?: string;
  years_in_business?: number;
  annual_revenue?: string;
  number_of_employees?: number;
}

export interface MusicRightsInformation {
  has_registered_music: boolean;
  music_rights_status: MusicRightsStatus;
  ascap_member_id?: string;
  bmi_member_id?: string;
  sesac_member_id?: string;
  interested_in_trap_chain: boolean;
  number_of_songs?: number;
  genres: string[];
}

export interface FundingRequest {
  funding_type: FundingType;
  amount_requested: number;
  funding_needs: FundingNeed[];
  detailed_breakdown: string;
  business_plan_summary: string;
  how_funds_will_be_used: string;
  expected_roi_timeline: string;
  emergency_details?: EmergencyFundingDetails;
}

export interface EmergencyFundingDetails {
  emergency_type: EmergencyType;
  emergency_description: string;
  proof_of_impact?: string;
  urgent_timeline: string;
  specific_relief_needed: string;
}

export interface FundingApplication {
  id: string;
  applicant: Applicant;
  business_information: BusinessInformation;
  music_rights_information: MusicRightsInformation;
  funding_request: FundingRequest;
  additional_documents: string[];
  status: ApplicationStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  funding_decision?: {
    approved_amount?: number;
    conditions?: string[];
    disbursement_schedule?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BezyCares501c3Info {
  organization_name: string;
  ein: string;
  mission_statement: string;
  focus_areas: string[];
  funding_criteria: {
    max_amount: number;
    eligible_expenses: string[];
    required_documentation: string[];
  };
  application_process: {
    steps: string[];
    review_timeline: string;
    approval_criteria: string[];
  };
}

class CreatorFundingService {
  private static instance: CreatorFundingService;
  private applications: FundingApplication[] = [];
  private bezyCares501c3: BezyCares501c3Info;

  constructor() {
    this.bezyCares501c3 = {
      organization_name: 'BEZY CARES',
      ein: '88-1234567', // Example EIN
      mission_statement: 'Empowering creative entrepreneurs and small businesses through financial support, education, and community resources.',
      focus_areas: [
        'Small business development for creative entrepreneurs',
        'Music industry business formation and growth',
        'Emergency relief for artists and creators',
        'Digital literacy and marketing skills for creators',
        'Legal and administrative support for creative businesses'
      ],
      funding_criteria: {
        max_amount: 2500,
        eligible_expenses: [
          'Business registration and filing fees',
          'Marketing and promotional materials',
          'Equipment necessary for business operations',
          'Legal and professional services',
          'Emergency relief for disaster-impacted creators',
          'Copyright and trademark registration fees',
          'Website development and digital presence',
          'Studio time and recording equipment'
        ],
        required_documentation: [
          'Completed funding application',
          'Business plan or project description',
          'Proof of creative work or business activity',
          'Financial statements or income documentation',
          'Emergency documentation (if applying for relief)'
        ]
      },
      application_process: {
        steps: [
          'Complete online application form',
          'Submit required documentation',
          'Application review by BEZY CARES committee',
          'Applicant interview (if selected)',
          'Funding decision notification',
          'Grant disbursement and reporting requirements'
        ],
        review_timeline: '2-4 weeks from submission',
        approval_criteria: [
          'Clear business or creative vision',
          'Demonstrated financial need',
          'Realistic funding request and use plan',
          'Potential for positive community impact',
          'Commitment to reporting and accountability'
        ]
      }
    };
    this.loadApplications();
  }

  public static getInstance(): CreatorFundingService {
    if (!CreatorFundingService.instance) {
      CreatorFundingService.instance = new CreatorFundingService();
    }
    return CreatorFundingService.instance;
  }

  private async loadApplications(): Promise<void> {
    try {
      const storedApplications = await AsyncStorage.getItem('creator_funding_applications');
      if (storedApplications) {
        this.applications = JSON.parse(storedApplications);
      } else {
        // Initialize with sample data
        this.applications = this.generateSampleApplications();
        await this.saveApplications();
      }
    } catch (error) {
      console.error('Error loading funding applications:', error);
      this.applications = this.generateSampleApplications();
    }
  }

  private async saveApplications(): Promise<void> {
    try {
      await AsyncStorage.setItem('creator_funding_applications', JSON.stringify(this.applications));
    } catch (error) {
      console.error('Error saving funding applications:', error);
    }
  }

  public async createApplication(applicationData: Omit<FundingApplication, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<FundingApplication> {
    const newApplication: FundingApplication = {
      ...applicationData,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: ApplicationStatus.DRAFT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.applications.unshift(newApplication);
    await this.saveApplications();
    return newApplication;
  }

  public async submitApplication(applicationId: string): Promise<boolean> {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return false;

    application.status = ApplicationStatus.SUBMITTED;
    application.submitted_at = new Date().toISOString();
    application.updated_at = new Date().toISOString();

    await this.saveApplications();
    return true;
  }

  public async getApplications(userId?: string): Promise<FundingApplication[]> {
    // In a real implementation, filter by user ID
    return this.applications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getApplicationById(id: string): Promise<FundingApplication | null> {
    return this.applications.find(app => app.id === id) || null;
  }

  public getBezyCares501c3Info(): BezyCares501c3Info {
    return this.bezyCares501c3;
  }

  public async updateApplicationStatus(applicationId: string, status: ApplicationStatus, reviewerNotes?: string): Promise<boolean> {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return false;

    application.status = status;
    application.updated_at = new Date().toISOString();

    if (reviewerNotes) {
      application.reviewer_notes = reviewerNotes;
    }

    if (status === ApplicationStatus.APPROVED || status === ApplicationStatus.DENIED) {
      application.reviewed_at = new Date().toISOString();
    }

    await this.saveApplications();
    return true;
  }

  private generateSampleApplications(): FundingApplication[] {
    return [
      {
        id: 'app_1',
        applicant: {
          id: 'user_1',
          full_name: 'Maya Rodriguez',
          email: 'maya@example.com',
          phone: '(555) 123-4567',
          address: {
            street: '123 Music Row',
            city: 'Nashville',
            state: 'TN',
            zip_code: '37203'
          },
          date_of_birth: '1995-03-15',
          social_media: {
            instagram: '@mayarodriguezmusic',
            spotify: 'Maya Rodriguez',
            youtube: 'MayaRodriguezOfficial'
          }
        },
        business_information: {
          business_name: 'Maya Music LLC',
          business_structure: BusinessStructure.LLC,
          ein: '12-3456789',
          business_registration_date: '2023-01-15',
          years_in_business: 1,
          annual_revenue: '$15,000',
          number_of_employees: 1
        },
        music_rights_information: {
          has_registered_music: true,
          music_rights_status: MusicRightsStatus.ASCAP_MEMBER,
          ascap_member_id: 'ASCAP123456',
          interested_in_trap_chain: false,
          number_of_songs: 25,
          genres: ['Pop', 'R&B', 'Latin']
        },
        funding_request: {
          funding_type: FundingType.GENERAL_BUSINESS,
          amount_requested: 2000,
          funding_needs: [FundingNeed.MARKETING, FundingNeed.EQUIPMENT],
          detailed_breakdown: 'Marketing campaign: $1,200, Recording equipment: $800',
          business_plan_summary: 'Expanding music career with professional recording setup and targeted marketing to reach wider audience.',
          how_funds_will_be_used: 'Funds will be used to purchase professional microphone and audio interface, plus run targeted social media advertising campaigns.',
          expected_roi_timeline: '6-12 months'
        },
        additional_documents: ['business_plan.pdf', 'financial_statements.pdf'],
        status: ApplicationStatus.APPROVED,
        submitted_at: '2024-12-15T10:00:00Z',
        reviewed_at: '2024-12-20T14:30:00Z',
        reviewer_notes: 'Strong business plan and clear ROI strategy. Approved for full amount.',
        funding_decision: {
          approved_amount: 2000,
          conditions: ['Submit quarterly progress reports', 'Provide receipts for all purchases'],
          disbursement_schedule: '50% upfront, 50% after 3-month progress report'
        },
        created_at: '2024-12-10T08:00:00Z',
        updated_at: '2024-12-20T14:30:00Z'
      },
      {
        id: 'app_2',
        applicant: {
          id: 'user_2',
          full_name: 'Jordan Chen',
          email: 'jordan@example.com',
          phone: '(555) 987-6543',
          address: {
            street: '456 Creative Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip_code: '90028'
          },
          date_of_birth: '1992-08-22',
          social_media: {
            instagram: '@jordanchenbeats',
            soundcloud: 'JordanChenProducer'
          }
        },
        business_information: {
          business_structure: BusinessStructure.NOT_REGISTERED,
          years_in_business: 0
        },
        music_rights_information: {
          has_registered_music: false,
          music_rights_status: MusicRightsStatus.TRAP_CHAIN_INTERESTED,
          interested_in_trap_chain: true,
          number_of_songs: 12,
          genres: ['Hip-Hop', 'Electronic', 'Trap']
        },
        funding_request: {
          funding_type: FundingType.EMERGENCY_RELIEF,
          amount_requested: 2500,
          funding_needs: [FundingNeed.EQUIPMENT, FundingNeed.STUDIO_TIME],
          detailed_breakdown: 'Replace equipment lost in LA fires: $2,000, Studio rental for urgent project: $500',
          business_plan_summary: 'Music producer recovering from LA fire damage, need to replace equipment to continue client work.',
          how_funds_will_be_used: 'Emergency replacement of production equipment lost in fires, plus studio time to complete pending client projects.',
          expected_roi_timeline: 'Immediate - have $3,000 in pending client work',
          emergency_details: {
            emergency_type: EmergencyType.LA_FIRES,
            emergency_description: 'Lost all production equipment and home studio in Palisades fire. Have immediate client deadlines and need to continue work.',
            proof_of_impact: 'Insurance claim filed, evacuation notice, photos of damaged property',
            urgent_timeline: 'Need equipment within 1 week to meet client deadlines',
            specific_relief_needed: 'Production laptop, audio interface, studio monitors, and temporary studio access'
          }
        },
        additional_documents: ['insurance_claim.pdf', 'evacuation_notice.pdf', 'client_contracts.pdf'],
        status: ApplicationStatus.UNDER_REVIEW,
        submitted_at: '2024-12-28T16:00:00Z',
        created_at: '2024-12-28T15:30:00Z',
        updated_at: '2024-12-28T16:00:00Z'
      }
    ];
  }
}

export const creatorFundingService = CreatorFundingService.getInstance();