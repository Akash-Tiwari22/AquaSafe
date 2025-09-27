import { WaterQualityData } from '@/contexts/DataContext';

export interface QueryResponse {
  answer: string;
  isReportRelated: boolean;
  suggestions?: string[];
}

export class QueryProcessor {
  private data: WaterQualityData;

  constructor(data: WaterQualityData) {
    this.data = data;
  }

  processQuery(query: string): QueryResponse {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check if query is report-related
    const reportKeywords = [
      'report', 'analysis', 'water', 'quality', 'metal', 'contamination',
      'arsenic', 'lead', 'mercury', 'cadmium', 'chromium', 'hmpi',
      'safe', 'unsafe', 'critical', 'pollution', 'sample', 'data',
      'concentration', 'limit', 'bis', 'standard', 'trend', 'distribution'
    ];

    const isReportRelated = reportKeywords.some(keyword => 
      normalizedQuery.includes(keyword)
    );

    if (!isReportRelated) {
      return {
        answer: "I'm AquaSafe Assistant, specialized in water quality analysis. Please ask me questions about water quality data, contamination levels, or analysis reports.",
        isReportRelated: false,
        suggestions: [
          "What's the current HMPI value?",
          "Show me arsenic contamination levels",
          "What percentage of samples are safe?",
          "Which metals exceed BIS limits?"
        ]
      };
    }

    // Process report-related queries
    return this.processReportQuery(normalizedQuery);
  }

  private processReportQuery(query: string): QueryResponse {
    // HMPI related queries
    if (query.includes('hmpi') || query.includes('pollution index')) {
      return {
        answer: `The current Heavy Metal Pollution Index (HMPI) is ${this.data.avgHMPI.toFixed(1)}. ${
          this.data.avgHMPI > 70 
            ? 'This indicates relatively safe water quality with acceptable heavy metal levels.' 
            : 'This suggests elevated heavy metal contamination that requires attention.'
        }`,
        isReportRelated: true,
        suggestions: [
          "What metals contribute to this HMPI?",
          "Show HMPI trend over time",
          "How does this compare to BIS standards?"
        ]
      };
    }

    // Sample distribution queries
    if (query.includes('safe') && (query.includes('sample') || query.includes('percentage'))) {
      return {
        answer: `Currently, ${this.data.safeQuality.toFixed(1)}% of water samples are classified as safe quality, while ${this.data.unsafeCritical.toFixed(1)}% are unsafe or critical. This is based on analysis of ${this.data.sampleCount} samples.`,
        isReportRelated: true,
        suggestions: [
          "What makes samples unsafe?",
          "Which regions have the most unsafe samples?",
          "How can we improve water safety?"
        ]
      };
    }

    // Specific metal queries
    const metals = {
      'arsenic': { value: this.data.metalConcentrations.arsenic, limit: 0.01, unit: 'mg/L' },
      'lead': { value: this.data.metalConcentrations.lead, limit: 0.01, unit: 'mg/L' },
      'mercury': { value: this.data.metalConcentrations.mercury, limit: 0.001, unit: 'mg/L' },
      'cadmium': { value: this.data.metalConcentrations.cadmium, limit: 0.003, unit: 'mg/L' },
      'chromium': { value: this.data.metalConcentrations.chromium, limit: 0.05, unit: 'mg/L' }
    };

    for (const [metalName, metalData] of Object.entries(metals)) {
      if (query.includes(metalName)) {
        const status = metalData.value > metalData.limit ? 'exceeds' : 'is within';
        const concern = metalData.value > metalData.limit ? 'This requires immediate attention and treatment.' : 'This is within safe limits.';
        
        return {
          answer: `${metalName.charAt(0).toUpperCase() + metalName.slice(1)} concentration is ${metalData.value.toFixed(4)} ${metalData.unit}, which ${status} the BIS limit of ${metalData.limit} ${metalData.unit}. ${concern}`,
          isReportRelated: true,
          suggestions: [
            `What are the health effects of ${metalName}?`,
            `How to reduce ${metalName} in water?`,
            `Show ${metalName} trends over time`
          ]
        };
      }
    }

    // Contamination and limits queries
    if (query.includes('limit') || query.includes('standard') || query.includes('bis')) {
      const exceedingMetals = [];
      Object.entries(metals).forEach(([name, data]) => {
        if (data.value > data.limit) {
          exceedingMetals.push(name);
        }
      });

      if (exceedingMetals.length > 0) {
        return {
          answer: `The following metals exceed BIS standards: ${exceedingMetals.join(', ')}. Immediate water treatment and monitoring are recommended to bring these levels within safe limits.`,
          isReportRelated: true,
          suggestions: [
            "What treatment methods are recommended?",
            "How often should we monitor these levels?",
            "What are the health risks?"
          ]
        };
      } else {
        return {
          answer: `Good news! All heavy metal concentrations are currently within BIS (Bureau of Indian Standards) limits. Continue regular monitoring to maintain water safety.`,
          isReportRelated: true,
          suggestions: [
            "What's the recommended monitoring frequency?",
            "How can we maintain these safe levels?",
            "Show me the complete analysis report"
          ]
        };
      }
    }

    // General report queries
    if (query.includes('summary') || query.includes('overview') || query.includes('report')) {
      return {
        answer: `Water Quality Summary: HMPI is ${this.data.avgHMPI.toFixed(1)}, with ${this.data.safeQuality.toFixed(1)}% safe samples and ${this.data.unsafeCritical.toFixed(1)}% unsafe/critical samples from ${this.data.sampleCount} total samples analyzed. ${
          this.data.avgHMPI > 70 ? 'Overall water quality is acceptable.' : 'Water quality requires improvement.'
        }`,
        isReportRelated: true,
        suggestions: [
          "Show detailed metal analysis",
          "What are the main concerns?",
          "Download complete report"
        ]
      };
    }

    // Default response for unrecognized report queries
    return {
      answer: `I understand you're asking about water quality data. Based on our current analysis: HMPI is ${this.data.avgHMPI.toFixed(1)}, ${this.data.safeQuality.toFixed(1)}% of samples are safe, and we've analyzed ${this.data.sampleCount} samples total. Could you be more specific about what aspect you'd like to know?`,
      isReportRelated: true,
      suggestions: [
        "Show metal concentrations",
        "What's the water safety status?",
        "Explain the HMPI value",
        "Which areas need attention?"
      ]
    };
  }
}
