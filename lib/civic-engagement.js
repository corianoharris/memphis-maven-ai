/**
 * Civic Engagement & Local Advocacy System
 * Connects users with civic participation opportunities and advocacy tools
 */

class CivicEngagementSystem {
  constructor() {
    this.initiativeData = this.loadInitiativeData();
    this.campaignData = this.loadCampaignData();
    this.representativeData = this.loadRepresentativeData();
    this.votingData = this.loadVotingData();
    this.meetingData = this.loadMeetingData();
  }

  /**
   * Load civic initiative data
   */
  loadInitiativeData() {
    return {
      currentInitiatives: [
        {
          id: 'initiative-001',
          title: 'Memphis Green Spaces Initiative',
          description: 'Expanding parks and green spaces in underserved neighborhoods',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2025-06-30',
          priority: 'high',
          category: 'environment',
          contactInfo: {
            organizer: 'Memphis Parks Coalition',
            email: 'info@memphisparks.org',
            phone: '(901) 636-4420'
          },
          gettingInvolved: {
            volunteerOpportunities: true,
            petitionSigning: true,
            attendingMeetings: true,
            spreadingAwareness: true
          }
        },
        {
          id: 'initiative-002',
          title: 'Community Safety Partnership',
          description: 'Collaborative approach to neighborhood safety through community-police partnerships',
          status: 'planning',
          startDate: '2024-03-01',
          endDate: '2024-12-31',
          priority: 'medium',
          category: 'publicSafety',
          contactInfo: {
            organizer: 'Memphis Safety Alliance',
            email: 'safety@memphistn.gov',
            phone: '(901) 576-5000'
          },
          gettingInvolved: {
            volunteerOpportunities: true,
            petitionSigning: false,
            attendingMeetings: true,
            spreadingAwareness: true
          }
        },
        {
          id: 'initiative-003',
          title: 'Digital Equity for All',
          description: 'Expanding internet access and digital literacy programs',
          status: 'active',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          priority: 'high',
          category: 'technology',
          contactInfo: {
            organizer: 'Digital Memphis Coalition',
            email: 'equity@digitalmemphis.org',
            phone: '(901) 555-0123'
          },
          gettingInvolved: {
            volunteerOpportunities: true,
            petitionSigning: true,
            attendingMeetings: true,
            spreadingAwareness: true
          }
        }
      ],

      upcomingElections: [
        {
          type: 'municipal',
          date: '2024-10-03',
          offices: [
            'Mayor',
            'City Council (All Districts)',
            'City Judge',
            'City Attorney'
          ],
          registrationDeadline: '2024-09-03',
          absenteeDeadline: '2024-10-02',
          sampleBallot: 'Available 30 days before election'
        },
        {
          type: 'state',
          date: '2024-11-05',
          offices: [
            'Governor',
            'State Senate',
            'State House of Representatives',
            'Attorney General'
          ],
          registrationDeadline: '2024-10-04',
          absenteeDeadline: '2024-11-04',
          sampleBallot: 'Available 45 days before election'
        }
      ]
    };
  }

  /**
   * Load campaign and advocacy data
   */
  loadCampaignData() {
    return {
      activeCampaigns: [
        {
          id: 'campaign-001',
          title: 'Fair Transit for All',
          description: 'Campaign to improve public transit reliability and accessibility',
          target: 'MATA Board of Directors',
          goals: [
            'Increase frequency of buses on main routes',
            'Extend evening service hours',
            'Improve accessibility at bus stops',
            'Reduce fare costs for low-income residents'
          ],
          status: 'lobbying',
          timeline: '6 months',
          progress: 65,
          supporters: 1250,
          actions: [
            {
              type: 'email',
              target: 'MATA Board Members',
              template: 'transit-improvements',
              urgency: 'high'
            },
            {
              type: 'phone',
              target: 'City Council Transportation Committee',
              template: 'transit-urgency',
              urgency: 'medium'
            }
          ]
        },
        {
          id: 'campaign-002',
          title: 'Affordable Housing Solutions',
          description: 'Advocating for increased affordable housing development and tenant protections',
          target: 'Planning Commission & City Council',
          goals: [
            'Increase affordable housing requirements in new developments',
            'Strengthen rent control measures',
            'Provide assistance for first-time homebuyers',
            'Address housing discrimination'
          ],
          status: 'research',
          timeline: '12 months',
          progress: 30,
          supporters: 890,
          actions: [
            {
              type: 'meeting',
              target: 'Planning Commission',
              template: 'housing-development',
              urgency: 'medium'
            },
            {
              type: 'petition',
              target: 'Voters',
              template: 'housing-support',
              urgency: 'medium'
            }
          ]
        }
      ],

      policyPriorities: [
        {
          area: 'Education',
          priority: 'Expand early childhood education programs',
          impact: 'high',
          timeframe: '1-2 years',
          stakeholders: ['School Board', 'Mayor Office', 'State Legislature']
        },
        {
          area: 'Environment',
          priority: 'Implement comprehensive recycling program',
          impact: 'medium',
          timeframe: '6 months',
          stakeholders: ['City Council', 'Sanitation Department']
        },
        {
          area: 'Economic Development',
          priority: 'Support small business development in underserved areas',
          impact: 'high',
          timeframe: '2-3 years',
          stakeholders: ['Economic Development', 'Chamber of Commerce']
        }
      ]
    };
  }

  /**
   * Load representative data
   */
  loadRepresentativeData() {
    return {
      federal: [
        {
          office: 'US Senator',
          name: 'Bill Hagerty',
          party: 'Republican',
          committee: ['Foreign Relations', 'Banking', 'Homeland Security'],
          contact: {
            dc: '(202) 224-3344',
            memphis: '(901) 327-7575',
            website: 'www.hagerty.senate.gov'
          }
        },
        {
          office: 'US Senator',
          name: 'Marsha Blackburn',
          party: 'Republican',
          committee: ['Judiciary', 'Commerce', 'Veterans Affairs'],
          contact: {
            dc: '(202) 224-3344',
            memphis: '(901) 327-7575',
            website: 'www.blackburn.senate.gov'
          }
        },
        {
          office: 'US Representative',
          name: 'Steve Cohen',
          district: 9,
          party: 'Democrat',
          committee: ['Transportation & Infrastructure', 'Judiciary'],
          contact: {
            dc: '(202) 225-3265',
            memphis: '(901) 544-4131',
            website: 'www.cohen.house.gov'
          }
        }
      ],

      state: [
        {
          office: 'State Senator',
          name: 'Raumesh Akbari',
          district: 29,
          party: 'Democrat',
          committee: ['Finance', 'Health & Welfare', 'Public Lands'],
          contact: {
            nashville: '(615) 741-1764',
            district: '(901) 578-3378',
            email: 'sen.akbari@capitol.tn.gov'
          }
        },
        {
          office: 'State Representative',
          name: 'Karen Camper',
          district: 87,
          party: 'Democrat',
          committee: ['Education', 'Children & Family Affairs'],
          contact: {
            nashville: '(615) 741-4414',
            district: '(901) 542-3671',
            email: 'rep.karen.camper@capitol.tn.gov'
          }
        }
      ],

      local: [
        {
          office: 'Mayor',
          name: 'Jim Strickland',
          party: 'Independent',
          term: '2024-2027',
          contact: {
            office: '(901) 576-6000',
            email: 'mayor@memphistn.gov',
            website: 'memphistn.gov/mayor'
          }
        },
        {
          office: 'City Council Chairman',
          name: 'J. B. Smiley Jr.',
          district: 2,
          party: 'Democrat',
          contact: {
            office: '(901) 576-6786',
            email: 'council.smiley@memphistn.gov'
          }
        }
      ]
    };
  }

  /**
   * Load voting information
   */
  loadVotingData() {
    return {
      registration: {
        requirements: [
          'Be a US citizen',
          'Be 18 years old by election day',
          'Be a Tennessee resident',
          'Not be disqualified due to felony conviction'
        ],
        onlineRegistration: 'https://ovr.govote.tn.gov/',
        deadline: '30 days before election',
        updateInfo: 'Same as registration deadline',
        checkStatus: 'https://ovr.govote.tn.gov/'
      },

      votingOptions: {
        inPerson: {
          available: true,
          earlyVoting: '20 days before election (excluding weekends)',
          electionDay: 'Polls open 7 AM - 7 PM',
          locations: 'Find at tn.gov/sos/elections'
        },
        absentee: {
          available: true,
          eligibility: ['Age 60+', 'Student', 'Military', 'Medical emergency'],
          deadline: '7 days before election',
          howToApply: 'Download form from tn.gov/sos'
        },
        mailIn: {
          available: true,
          eligibility: ['Military overseas', 'US citizens abroad'],
          deadline: '30 days before election',
          howToApply: 'Federal Voting Assistance Program'
        }
      },

      voterID: {
        requirement: 'Valid photo ID required',
        acceptedIDs: [
          'Driver license',
          'Passport',
          'Military ID',
          'Tennessee handgun carry permit'
        ],
        freeID: 'Available at DMV for registered voters without ID',
        process: 'Apply at any County Clerk office'
      }
    };
  }

  /**
   * Load public meeting data
   */
  loadMeetingData() {
    return {
      cityCouncil: {
        frequency: '1st and 3rd Tuesday each month',
        time: '3:30 PM',
        location: 'City Hall, 125 N. Main St, Room 251',
        agenda: 'Available 48 hours before meeting',
        publicComment: 'Sign up by 9 AM day of meeting',
        broadcast: 'Channel 99 (City View)',
        streaming: 'memphistn.gov/livestream'
      },

      planningCommission: {
        frequency: '2nd and 4th Thursday each month',
        time: '4:00 PM',
        location: 'City Hall, 125 N. Main St, Room 468',
        agenda: 'Available 3 days before meeting',
        publicComment: 'Sign up by 10 AM day of meeting',
        contact: '(901) 636-7177'
      },

      communityMeetings: [
        {
          name: 'Neighborhood Leadership Council',
          frequency: 'Monthly',
          time: '6:00 PM',
          location: 'Various community centers',
          contact: '(901) 636-4123',
          agenda: 'Contact for monthly schedule'
        },
        {
          name: 'Transit Advisory Committee',
          frequency: 'Bi-monthly',
          time: '5:30 PM',
          location: 'MATA Headquarters, 444 N Main St',
          contact: '(901) 274-6282',
          agenda: 'Available one week before meeting'
        }
      ]
    };
  }

  /**
   * Get civic engagement opportunities
   */
  async getCivicOpportunities(zipCode = null, interests = []) {
    try {
      const opportunities = {
        immediate: this.getImmediateOpportunities(zipCode),
        upcoming: this.getUpcomingEvents(zipCode),
        ongoing: this.getOngoingInitiatives(zipCode),
        representativeInfo: this.getRepresentativeContactInfo(zipCode),
        advocacyTools: this.getAdvocacyTools()
      };

      return {
        success: true,
        data: opportunities
      };

    } catch (error) {
      console.error('Error getting civic opportunities:', error);
      return {
        success: false,
        error: 'Unable to retrieve civic engagement information'
      };
    }
  }

  /**
   * Get immediate opportunities
   */
  getImmediateOpportunities(zipCode) {
    return {
      actions: [
        {
          type: 'email',
          title: 'Contact Council About Transit Funding',
          description: 'Urgent funding needed for MATA improvements',
          target: 'Transportation Committee',
          deadline: 'This Friday',
          template: 'transit-funding-urgency',
          estimatedTime: '5 minutes'
        },
        {
          type: 'meeting',
          title: 'Attend Community Safety Forum',
          description: 'Monthly neighborhood safety discussion',
          date: this.formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Next week
          time: '6:00 PM',
          location: 'Central Library',
          rsvpRequired: true
        }
      ],

      petitions: [
        {
          title: 'Support Memphis Green Spaces',
          description: 'Expand parks in underserved neighborhoods',
          signatures: 1247,
          goal: 2000,
          deadline: 'November 30, 2024',
          actionUrl: 'https://actioncenter.memphisparks.org'
        }
      ],

      volunteer: [
        {
          organization: 'Community Clean-Up Coalition',
          role: 'Neighborhood Beautification Volunteer',
          schedule: 'Saturdays 9 AM - 12 PM',
          location: 'Various Memphis neighborhoods',
          contact: '(901) 555-0199',
          description: 'Help clean and beautify Memphis neighborhoods'
        }
      ]
    };
  }

  /**
   * Get upcoming civic events
   */
  getUpcomingEvents(zipCode) {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      elections: this.initiativeData.upcomingElections.filter(election => 
        new Date(election.date) <= nextMonth
      ),

      meetings: this.getNextMeetings(),

      communityEvents: [
        {
          title: 'City Budget Public Input Meeting',
          date: this.formatDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)), // 2 weeks
          time: '6:00 PM',
          location: 'City Hall Auditorium',
          purpose: 'Community input on FY 2025 budget priorities',
          registration: 'Recommended'
        },
        {
          title: 'Memphis Climate Action Workshop',
          date: this.formatDate(new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000)), // 3 weeks
          time: '2:00 PM',
          location: 'Binghampton Community Center',
          purpose: 'Community workshop on climate action planning',
          registration: 'Required - Limited to 50 participants'
        }
      ]
    };
  }

  /**
   * Get next scheduled meetings
   */
  getNextMeetings() {
    const now = new Date();
    
    return [
      {
        name: 'City Council Meeting',
        nextDate: this.getNextCouncilMeeting(),
        time: '3:30 PM',
        location: 'City Hall, Room 251',
        agendaItems: [
          'Transit Funding Proposal',
          'Affordable Housing Development',
          'Green Space Initiative Update'
        ],
        publicCommentDeadline: '9:00 AM day of meeting'
      },
      {
        name: 'Planning Commission',
        nextDate: this.getNextPlanningCommission(),
        time: '4:00 PM',
        location: 'City Hall, Room 468',
        agendaItems: [
          'Zoning Changes - Downtown',
          'Development Permits Review'
        ],
        publicCommentDeadline: '10:00 AM day of meeting'
      }
    ];
  }

  /**
   * Get next council meeting date
   */
  getNextCouncilMeeting() {
    const now = new Date();
    const nextMeeting = new Date(now);
    
    // Council meets 1st and 3rd Tuesday
    const daysUntilNextTuesday = (9 - now.getDay()) % 7 || 7; // Next Tuesday
    nextMeeting.setDate(now.getDate() + daysUntilNextTuesday);
    
    // If it's the 2nd Tuesday, go to 3rd
    const dayOfMonth = nextMeeting.getDate();
    if (dayOfMonth > 7 && dayOfMonth <= 14) {
      nextMeeting.setDate(nextMeeting.getDate() + 7); // Move to 3rd Tuesday
    }
    
    return this.formatDate(nextMeeting);
  }

  /**
   * Get next planning commission meeting date
   */
  getNextPlanningCommission() {
    const now = new Date();
    const nextMeeting = new Date(now);
    
    // Planning Commission meets 2nd and 4th Thursday
    const daysUntilNextThursday = (5 - now.getDay()) % 7 || 7; // Next Thursday
    nextMeeting.setDate(now.getDate() + daysUntilNextThursday);
    
    // If it's the 3rd Thursday, go to 4th
    const dayOfMonth = nextMeeting.getDate();
    if (dayOfMonth > 14 && dayOfMonth <= 21) {
      nextMeeting.setDate(nextMeeting.getDate() + 7); // Move to 4th Thursday
    }
    
    return this.formatDate(nextMeeting);
  }

  /**
   * Get ongoing civic initiatives
   */
  getOngoingInitiatives(zipCode) {
    return this.initiativeData.currentInitiatives.map(initiative => ({
      ...initiative,
      localRelevance: this.assessLocalRelevance(initiative, zipCode),
      actionItems: this.getInitiativeActions(initiative)
    }));
  }

  /**
   * Assess local relevance for an initiative
   */
  assessLocalRelevance(initiative, zipCode) {
    // Simplified relevance assessment
    if (!zipCode) return 'general';
    
    // Check if initiative has specific area focus
    if (initiative.targetAreas && initiative.targetAreas.includes(zipCode)) {
      return 'high';
    }
    
    // Check if initiative affects multiple areas
    if (initiative.impactScope === 'citywide') {
      return 'medium';
    }
    
    return 'general';
  }

  /**
   * Get specific actions for an initiative
   */
  getInitiativeActions(initiative) {
    const actions = [];
    
    if (initiative.gettingInvolved.petitionSigning) {
      actions.push({
        type: 'sign-petition',
        description: 'Sign the petition to support this initiative',
        timeRequired: '2 minutes',
        link: `https://petitions.memphisvoices.org/${initiative.id}`
      });
    }
    
    if (initiative.gettingInvolved.attendingMeetings) {
      actions.push({
        type: 'attend-meeting',
        description: 'Attend public meetings to voice support',
        timeRequired: '2 hours',
        nextMeeting: this.getInitiativeNextMeeting(initiative)
      });
    }
    
    if (initiative.gettingInvolved.volunteerOpportunities) {
      actions.push({
        type: 'volunteer',
        description: 'Volunteer to help with the initiative',
        timeRequired: 'Varies',
        contact: initiative.contactInfo
      });
    }
    
    if (initiative.gettingInvolved.spreadingAwareness) {
      actions.push({
        type: 'share',
        description: 'Share information with neighbors and friends',
        timeRequired: '5 minutes',
        shareableContent: this.generateShareableContent(initiative)
      });
    }
    
    return actions;
  }

  /**
   * Get next meeting for an initiative
   */
  getInitiativeNextMeeting(initiative) {
    // This would typically check a real calendar
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return {
      date: this.formatDate(nextWeek),
      time: '6:00 PM',
      location: 'Community Center',
      purpose: `${initiative.title} - Public Forum`
    };
  }

  /**
   * Generate shareable content for an initiative
   */
  generateShareableContent(initiative) {
    return {
      title: initiative.title,
      description: initiative.description,
      keyFacts: this.getKeyFacts(initiative),
      socialHashtags: this.getHashtags(initiative),
      shareUrl: `https://civicengagement.memphistn.gov/initiatives/${initiative.id}`
    };
  }

  /**
   * Get key facts about an initiative
   */
  getKeyFacts(initiative) {
    const facts = [];
    
    facts.push(`Status: ${initiative.status}`);
    facts.push(`Priority: ${initiative.priority}`);
    
    if (initiative.progress !== undefined) {
      facts.push(`Progress: ${initiative.progress}% complete`);
    }
    
    facts.push(`Timeline: ${initiative.startDate} - ${initiative.endDate}`);
    
    return facts;
  }

  /**
   * Get relevant hashtags for an initiative
   */
  getHashtags(initiative) {
    const categoryHashtags = {
      'environment': ['#CleanMemphis', '#GreenSpaces', '#EnvironmentalJustice'],
      'publicSafety': ['#SafeMemphis', '#CommunitySafety', '#PublicSafety'],
      'technology': ['#DigitalEquity', '#TechForAll', '#DigitalMemphis'],
      'housing': ['#AffordableHousing', '#HousingEquity', '#TenantRights'],
      'education': ['#EducationEquity', '#QualitySchools', '#StudentSuccess']
    };
    
    return categoryHashtags[initiative.category] || ['#CivicEngagement', '#MemphisVoices'];
  }

  /**
   * Get representative contact information
   */
  getRepresentativeContactInfo(zipCode) {
    return {
      federal: this.representativeData.federal.map(rep => ({
        ...rep,
        howToContact: this.generateContactInstructions(rep)
      })),
      state: this.representativeData.state.map(rep => ({
        ...rep,
        howToContact: this.generateContactInstructions(rep)
      })),
      local: this.representativeData.local.map(rep => ({
        ...rep,
        howToContact: this.generateContactInstructions(rep)
      }))
    };
  }

  /**
   * Generate contact instructions for representatives
   */
  generateContactInstructions(representative) {
    return {
      email: {
        available: !!representative.contact.email,
        address: representative.contact.email,
        subject: `Question/Concern from Memphis Resident`,
        template: `Dear ${representative.name},

I am writing as a constituent regarding [SPECIFIC ISSUE]. 
[EXPLAIN YOUR CONCERN]

I would appreciate your attention to this matter and look forward to your response.

Best regards,
[YOUR NAME]
[YOUR ADDRESS]
[YOUR CONTACT INFO]`
      },
      phone: {
        available: !!representative.contact.phone || !!representative.contact.dc,
        number: representative.contact.phone || representative.contact.dc,
        bestTimes: '9:00 AM - 4:00 PM, Monday - Friday',
        script: `Hello, I'm a constituent calling about [ISSUE]. I'd like to leave a message with [REPRESENTATIVE'S NAME] regarding [SPECIFIC CONCERN]. My name is [YOUR NAME] and my phone number is [YOUR NUMBER] in case you need to reach me.`
      },
      inPerson: {
        available: !!representative.contact.office,
        location: representative.contact.office,
        hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
        scheduling: 'Usually requires appointment'
      }
    };
  }

  /**
   * Get advocacy tools and resources
   */
  getAdvocacyTools() {
    return {
      templates: {
        email: {
          'transit-funding': {
            subject: 'Urgent: Memphis Transit Funding Needs',
            body: this.getTemplate('transit-funding')
          },
          'housing-development': {
            subject: 'Support for Affordable Housing Development',
            body: this.getTemplate('housing-development')
          }
        },
        phone: {
          script: 'general-concern',
          talkingPoints: this.getTalkingPoints()
        }
      },

      research: {
        voterGuide: 'https://tn.gov/sos/elections.html',
        candidateInfo: 'https://ballotpedia.org/Tennessee_Elections',
        ballotMeasures: 'https://voteproject.org/tn-ballot-measures',
        campaignFinance: 'https://tn.gov/sos/elections.html'
      },

      organizing: {
        neighborhoodGroups: this.getNeighborhoodGroups(),
        issueOrganizations: this.getIssueOrganizations(),
        eventPlanning: {
          location: 'https://permits.memphistn.gov',
          security: '(901) 576-4245',
          notification: 'City Communications (901) 576-6100'
        }
      }
    };
  }

  /**
   * Get email template content
   */
  getTemplate(templateType) {
    const templates = {
      'transit-funding': `Dear [Representative Name],

I am writing as a Memphis resident to express my urgent concern about transit funding. Our public transportation system needs immediate attention to serve our growing community.

[PERSONAL STORY - 2-3 sentences about your experience with transit]

I urge you to support increased funding for MATA to:
- Increase bus frequency on main routes
- Extend evening service hours
- Improve accessibility at bus stops
- Reduce fares for low-income residents

Our community deserves reliable, affordable public transportation. Please prioritize this critical infrastructure need.

Thank you for your attention to this matter.

Sincerely,
[Your Name]
[Your Address]
[Your Contact Information]`,

      'housing-development': `Dear [Representative Name],

As a Memphis resident, I am writing to express my strong support for affordable housing development in our community.

[PERSONAL CONNECTION - 1-2 sentences about why this issue matters to you]

I specifically support:
- Increasing affordable housing requirements in new developments
- Strengthening tenant protections
- Providing assistance for first-time homebuyers
- Addressing housing discrimination

Memphis families deserve access to safe, affordable housing. I encourage you to champion policies that expand housing opportunities for all residents.

Thank you for your consideration.

Best regards,
[Your Name]
[Your Address]
[Your Contact Information]`
    };

    return templates[templateType] || 'Template not found';
  }

  /**
   * Get talking points for phone calls
   */
  getTalkingPoints() {
    return {
      'transit-funding': [
        'Our current transit system leaves many residents without reliable transportation',
        'Increased funding would improve bus frequency and extend service hours',
        'Better transit access supports economic development and reduces inequality',
        'Memphis deserves investment in this essential public service'
      ],
      'housing-development': [
        'Housing affordability is a critical issue for Memphis families',
        'New developments should include provisions for affordable housing',
        'Strong tenant protections prevent displacement',
        'Supporting homeownership builds stronger communities'
      ]
    };
  }

  /**
   * Get local neighborhood groups
   */
  getNeighborhoodGroups() {
    return [
      {
        name: 'Cooper-Young Community Association',
        focus: 'Historic neighborhood preservation and community development',
        website: 'cooperyoung.org',
        contact: 'info@cooperyoung.org'
      },
      {
        name: 'Binghampton Development Corporation',
        focus: 'Economic development and community revitalization',
        website: 'binghamptondev.com',
        contact: 'info@binghamptondev.com'
      },
      {
        name: 'Frayser Community Development Corporation',
        focus: 'Housing development and neighborhood services',
        website: 'fraycdev.org',
        contact: 'info@fraycdev.org'
      }
    ];
  }

  /**
   * Get issue-based organizations
   */
  getIssueOrganizations() {
    return [
      {
        name: 'Memphis Community Coalition',
        focus: 'Community organizing and advocacy',
        website: 'memphiscommunitycoalition.org',
        contact: 'hello@memphiscommunitycoalition.org'
      },
      {
        name: 'Tennessee Immigrant & Refugee Rights Coalition',
        focus: 'Immigration rights and advocacy',
        website: 'tirrc.org',
        contact: 'info@tirrc.org'
      },
      {
        name: 'Sierra Club - Memphis Chapter',
        focus: 'Environmental advocacy',
        website: 'sierraclub.org/memphis',
        contact: 'memphis.chapter@sierraclub.org'
      }
    ];
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Generate civic engagement report
   */
  generateEngagementReport(userActivity) {
    return {
      summary: {
        totalActions: userActivity.totalActions || 0,
        meetingsAttended: userActivity.meetingsAttended || 0,
        representativesContacted: userActivity.representativesContacted || 0,
        campaignsSupported: userActivity.campaignsSupported || 0
      },
      impact: this.calculateImpact(userActivity),
      nextSteps: this.recommendNextSteps(userActivity),
      trends: this.analyzeEngagementTrends(userActivity)
    };
  }

  /**
   * Calculate impact score
   */
  calculateImpact(userActivity) {
    let score = 0;
    
    // Meeting attendance is high impact
    score += (userActivity.meetingsAttended || 0) * 10;
    
    // Direct contact with representatives
    score += (userActivity.representativesContacted || 0) * 15;
    
    // Campaign participation
    score += (userActivity.campaignsSupported || 0) * 5;
    
    // Community organizing
    score += (userActivity.eventsOrganized || 0) * 20;
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Recommend next steps based on activity
   */
  recommendNextSteps(userActivity) {
    const recommendations = [];
    
    if (!userActivity.meetingsAttended || userActivity.meetingsAttended < 3) {
      recommendations.push('Attend your next City Council or Planning Commission meeting');
    }
    
    if (!userActivity.representativesContacted || userActivity.representativesContacted < 2) {
      recommendations.push('Contact your elected representatives about an issue you care about');
    }
    
    if (userActivity.totalActions < 5) {
      recommendations.push('Join a local advocacy campaign');
    }
    
    recommendations.push('Sign up for civic engagement alerts and updates');
    
    return recommendations;
  }

  /**
   * Analyze engagement trends
   */
  analyzeEngagementTrends(userActivity) {
    return {
      participationRate: this.calculateParticipationRate(userActivity),
      interests: this.identifyInterestAreas(userActivity),
      engagementLevel: this.determineEngagementLevel(userActivity)
    };
  }

  /**
   * Calculate participation rate
   */
  calculateParticipationRate(userActivity) {
    const totalOpportunities = 20; // Estimated opportunities per quarter
    const userParticipated = userActivity.totalActions || 0;
    return Math.min((userParticipated / totalOpportunities) * 100, 100);
  }

  /**
   * Identify user interest areas
   */
  identifyInterestAreas(userActivity) {
    const interests = [];
    
    if (userActivity.issues.includes('transit')) interests.push('Transportation');
    if (userActivity.issues.includes('housing')) interests.push('Housing');
    if (userActivity.issues.includes('environment')) interests.push('Environment');
    if (userActivity.issues.includes('education')) interests.push('Education');
    if (userActivity.issues.includes('safety')) interests.push('Public Safety');
    
    return interests.length > 0 ? interests : ['General Civic Engagement'];
  }

  /**
   * Determine engagement level
   */
  determineEngagementLevel(userActivity) {
    const score = this.calculateImpact(userActivity);
    
    if (score >= 80) return 'High - Community Leader';
    if (score >= 50) return 'Active - Regular Participant';
    if (score >= 20) return 'Moderate - Occasional Participant';
    return 'Beginning - New to Civic Engagement';
  }
}

export { CivicEngagementSystem };