import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

interface ComplianceData {
  company: any;
  frameworks: any[];
  tasks: any[];
  risks: any[];
  documents: any[];
  gapAnalysis: any;
  velocityData: any;
}

interface ReportOptions {
  type: 'compliance_summary' | 'task_status' | 'executive_summary' | 'gap_analysis';
  data: ComplianceData;
  generatedBy: string;
}

export class ReportGenerator {
  private doc: any;
  private pageHeight: number = 792; // Letter size height
  private pageWidth: number = 612; // Letter size width
  private margin: number = 50;
  private currentY: number = 50;

  constructor() {
    this.doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin
      }
    });
  }

  async generateReport(options: ReportOptions): Promise<Buffer> {
    const { type, data } = options;
    
    // Reset document
    this.currentY = this.margin;
    
    // Add header
    this.addHeader(data.company);
    
    // Generate content based on type
    switch (type) {
      case 'compliance_summary':
        await this.generateComplianceSummary(data);
        break;
      case 'task_status':
        await this.generateTaskStatusReport(data);
        break;
      case 'executive_summary':
        await this.generateExecutiveSummary(data);
        break;
      case 'gap_analysis':
        await this.generateGapAnalysisReport(data);
        break;
    }
    
    // Add footer
    this.addFooter(options.generatedBy);
    
    // Finalize and return buffer
    this.doc.end();
    
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private addHeader(company: any) {
    // Company header
    this.doc.fontSize(24)
      .fillColor('#1a365d')
      .text('Compliance Report', this.margin, this.currentY, { align: 'center' });
    
    this.currentY += 40;
    
    if (company) {
      this.doc.fontSize(16)
        .fillColor('#2d3748')
        .text(`${company.name}`, this.margin, this.currentY, { align: 'center' });
      
      this.currentY += 25;
      
      this.doc.fontSize(12)
        .fillColor('#718096')
        .text(`Industry: ${company.industry || 'N/A'} | Size: ${company.size || 'N/A'}`, 
              this.margin, this.currentY, { align: 'center' });
    }
    
    this.currentY += 30;
    
    // Date
    this.doc.fontSize(10)
      .fillColor('#a0aec0')
      .text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, 
            this.margin, this.currentY, { align: 'center' });
    
    this.currentY += 30;
    
    // Separator line
    this.doc.moveTo(this.margin, this.currentY)
      .lineTo(this.pageWidth - this.margin, this.currentY)
      .strokeColor('#e2e8f0')
      .stroke();
    
    this.currentY += 20;
  }

  private async generateComplianceSummary(data: ComplianceData) {
    this.addSectionTitle('Compliance Framework Summary');
    
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Overall metrics
    this.addMetricsBox([
      { label: 'Overall Completion', value: `${overallCompletion}%` },
      { label: 'Total Tasks', value: totalTasks.toString() },
      { label: 'Completed Tasks', value: completedTasks.toString() },
      { label: 'Remaining Tasks', value: (totalTasks - completedTasks).toString() }
    ]);
    
    this.currentY += 30;
    
    // Framework breakdown
    if (data.gapAnalysis && data.gapAnalysis.frameworks) {
      this.addSubsectionTitle('Framework Breakdown');
      
      data.gapAnalysis.frameworks.forEach((framework: any) => {
        this.addFrameworkStatus(framework);
      });
    }
  }

  private async generateTaskStatusReport(data: ComplianceData) {
    this.addSectionTitle('Task Status Report');
    
    const tasksByStatus = {
      completed: data.tasks.filter(t => t.status === 'completed'),
      in_progress: data.tasks.filter(t => t.status === 'in_progress'),
      not_started: data.tasks.filter(t => t.status === 'not_started'),
      overdue: data.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed')
    };
    
    // Status summary
    this.addMetricsBox([
      { label: 'Completed', value: tasksByStatus.completed.length.toString() },
      { label: 'In Progress', value: tasksByStatus.in_progress.length.toString() },
      { label: 'Not Started', value: tasksByStatus.not_started.length.toString() },
      { label: 'Overdue', value: tasksByStatus.overdue.length.toString() }
    ]);
    
    this.currentY += 30;
    
    // Overdue tasks detail
    if (tasksByStatus.overdue.length > 0) {
      this.addSubsectionTitle('Overdue Tasks (Immediate Attention Required)');
      tasksByStatus.overdue.forEach((task: any) => {
        this.addTaskDetail(task, true);
      });
    }
    
    // High priority pending tasks
    const highPriorityPending = data.tasks.filter(t => 
      t.status !== 'completed' && (t.priority === 'high' || t.priority === 'critical')
    );
    
    if (highPriorityPending.length > 0) {
      this.addSubsectionTitle('High Priority Pending Tasks');
      highPriorityPending.slice(0, 10).forEach((task: any) => {
        this.addTaskDetail(task, false);
      });
    }
  }

  private async generateExecutiveSummary(data: ComplianceData) {
    this.addSectionTitle('Executive Summary');
    
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const criticalRisks = data.risks.filter(r => r.impact === 'high' && r.status === 'open').length;
    
    // Key metrics for executives
    this.addMetricsBox([
      { label: 'Compliance Status', value: `${overallCompletion}%` },
      { label: 'Frameworks Active', value: data.gapAnalysis?.frameworks?.length.toString() || '0' },
      { label: 'Critical Risks', value: criticalRisks.toString() },
      { label: 'Timeline Est.', value: data.velocityData?.weeksToCompletion ? `${data.velocityData.weeksToCompletion}w` : 'TBD' }
    ]);
    
    this.currentY += 30;
    
    // AI-generated executive summary
    this.addSubsectionTitle('Strategic Overview');
    
    let executiveSummary = this.generateExecutiveSummaryText(data);
    this.addParagraph(executiveSummary);
    
    // Key recommendations
    this.addSubsectionTitle('Key Recommendations');
    const recommendations = this.generateExecutiveRecommendations(data);
    recommendations.forEach((rec, index) => {
      this.addBulletPoint(`${index + 1}. ${rec}`);
    });
  }

  private async generateGapAnalysisReport(data: ComplianceData) {
    this.addSectionTitle('Detailed Gap Analysis');
    
    if (data.gapAnalysis && data.gapAnalysis.frameworks) {
      data.gapAnalysis.frameworks.forEach((framework: any) => {
        this.addSubsectionTitle(`${framework.displayName} - ${framework.completionPercentage}% Complete`);
        
        if (framework.missingRequirements.length > 0) {
          this.addText('Missing Requirements:', 12, '#2d3748', true);
          this.currentY += 10;
          
          framework.missingRequirements.forEach((req: string) => {
            this.addBulletPoint(req);
          });
          
          this.currentY += 15;
        }
        
        // Risk assessment for this framework
        const frameworkTasks = data.tasks.filter(t => t.frameworkId === framework.frameworkId);
        const criticalTasks = frameworkTasks.filter(t => t.priority === 'critical' && t.status !== 'completed');
        
        if (criticalTasks.length > 0) {
          this.addText(`Risk Level: ${framework.status.toUpperCase()}`, 12, this.getRiskColor(framework.status), true);
          this.addText(`Critical items requiring immediate attention: ${criticalTasks.length}`, 10, '#718096');
          this.currentY += 15;
        }
      });
    }
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(60);
    this.doc.fontSize(18)
      .fillColor('#1a365d')
      .text(title, this.margin, this.currentY);
    this.currentY += 30;
  }

  private addSubsectionTitle(title: string) {
    this.checkPageBreak(40);
    this.doc.fontSize(14)
      .fillColor('#2d3748')
      .text(title, this.margin, this.currentY);
    this.currentY += 20;
  }

  private addText(text: string, size: number = 10, color: string = '#4a5568', bold: boolean = false) {
    this.checkPageBreak(25);
    this.doc.fontSize(size)
      .fillColor(color);
    
    if (bold) {
      this.doc.font('Helvetica-Bold');
    } else {
      this.doc.font('Helvetica');
    }
    
    this.doc.text(text, this.margin, this.currentY, {
      width: this.pageWidth - (this.margin * 2),
      align: 'left'
    });
    this.currentY += size + 5;
  }

  private addParagraph(text: string) {
    this.checkPageBreak(50);
    this.doc.fontSize(10)
      .fillColor('#4a5568')
      .font('Helvetica')
      .text(text, this.margin, this.currentY, {
        width: this.pageWidth - (this.margin * 2),
        align: 'justify'
      });
    this.currentY += 50;
  }

  private addBulletPoint(text: string) {
    this.checkPageBreak(25);
    this.doc.fontSize(10)
      .fillColor('#4a5568')
      .font('Helvetica')
      .text(`• ${text}`, this.margin + 10, this.currentY, {
        width: this.pageWidth - (this.margin * 2) - 10,
        align: 'left'
      });
    this.currentY += 15;
  }

  private addMetricsBox(metrics: { label: string; value: string }[]) {
    this.checkPageBreak(80);
    
    const boxHeight = 60;
    const boxWidth = (this.pageWidth - (this.margin * 2) - 30) / metrics.length;
    
    metrics.forEach((metric, index) => {
      const x = this.margin + (index * (boxWidth + 10));
      
      // Background box
      this.doc.rect(x, this.currentY, boxWidth, boxHeight)
        .fillColor('#f7fafc')
        .fill()
        .strokeColor('#e2e8f0')
        .stroke();
      
      // Value
      this.doc.fontSize(16)
        .fillColor('#2d3748')
        .font('Helvetica-Bold')
        .text(metric.value, x, this.currentY + 15, {
          width: boxWidth,
          align: 'center'
        });
      
      // Label
      this.doc.fontSize(9)
        .fillColor('#718096')
        .font('Helvetica')
        .text(metric.label, x, this.currentY + 40, {
          width: boxWidth,
          align: 'center'
        });
    });
    
    this.currentY += boxHeight + 20;
  }

  private addFrameworkStatus(framework: any) {
    this.checkPageBreak(40);
    
    this.doc.fontSize(12)
      .fillColor('#2d3748')
      .font('Helvetica-Bold')
      .text(`${framework.displayName}`, this.margin, this.currentY);
    
    this.doc.fontSize(10)
      .fillColor('#718096')
      .font('Helvetica')
      .text(`${framework.completionPercentage}% complete (${framework.completedTasks}/${framework.totalTasks} tasks)`, 
            this.margin + 200, this.currentY);
    
    this.currentY += 15;
    
    // Progress bar
    const barWidth = 150;
    const barHeight = 8;
    const progressWidth = (framework.completionPercentage / 100) * barWidth;
    
    // Background
    this.doc.rect(this.margin, this.currentY, barWidth, barHeight)
      .fillColor('#e2e8f0')
      .fill();
    
    // Progress
    this.doc.rect(this.margin, this.currentY, progressWidth, barHeight)
      .fillColor(this.getProgressColor(framework.completionPercentage))
      .fill();
    
    this.currentY += 25;
  }

  private addTaskDetail(task: any, isOverdue: boolean) {
    this.checkPageBreak(35);
    
    const priorityColor = this.getPriorityColor(task.priority);
    const statusText = isOverdue ? 'OVERDUE' : task.status.replace('_', ' ').toUpperCase();
    
    this.doc.fontSize(11)
      .fillColor('#2d3748')
      .font('Helvetica-Bold')
      .text(task.title, this.margin, this.currentY);
    
    this.doc.fontSize(9)
      .fillColor(priorityColor)
      .font('Helvetica')
      .text(`${task.priority.toUpperCase()} | ${statusText}`, this.margin + 300, this.currentY);
    
    this.currentY += 15;
    
    if (task.dueDate) {
      this.doc.fontSize(9)
        .fillColor('#718096')
        .text(`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`, this.margin + 10, this.currentY);
      this.currentY += 12;
    }
    
    this.currentY += 8;
  }

  private generateExecutiveSummaryText(data: ComplianceData): string {
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const frameworks = data.gapAnalysis?.frameworks?.length || 0;
    
    return `Our organization is currently ${overallCompletion}% compliant across ${frameworks} active compliance frameworks. ` +
           `We have successfully completed ${completedTasks} out of ${totalTasks} required compliance tasks. ` +
           `${data.velocityData?.weeksToCompletion ? 
             `At our current pace, we are on track to achieve full compliance within ${data.velocityData.weeksToCompletion} weeks.` : 
             'Our compliance timeline requires assessment of current task completion velocity.'} ` +
           `This report identifies critical gaps requiring immediate attention and provides strategic recommendations for achieving compliance objectives efficiently.`;
  }

  private generateExecutiveRecommendations(data: ComplianceData): string[] {
    const recommendations = [];
    
    const overdueTasks = data.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      recommendations.push(`Address ${overdueTasks.length} overdue compliance tasks immediately to mitigate regulatory risk`);
    }
    
    const criticalTasks = data.tasks.filter(t => t.priority === 'critical' && t.status !== 'completed');
    if (criticalTasks.length > 0) {
      recommendations.push(`Prioritize ${criticalTasks.length} critical tasks that pose the highest compliance risk`);
    }
    
    if (data.velocityData?.velocityTrend === 'declining') {
      recommendations.push('Increase task completion velocity through additional resources or process optimization');
    }
    
    const openHighRisks = data.risks.filter(r => r.impact === 'high' && r.status === 'open').length;
    if (openHighRisks > 0) {
      recommendations.push(`Implement mitigation strategies for ${openHighRisks} high-impact compliance risks`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain current compliance momentum and monitor progress regularly');
      recommendations.push('Consider advancing timeline for remaining low-priority items');
    }
    
    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private addFooter(generatedBy: string) {
    const footerY = this.pageHeight - 30;
    
    this.doc.fontSize(8)
      .fillColor('#a0aec0')
      .text(`Generated by Venzip Compliance Platform | Report created by: ${generatedBy}`, 
            this.margin, footerY, { align: 'center' });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private getProgressColor(percentage: number): string {
    if (percentage >= 90) return '#38a169'; // Green
    if (percentage >= 70) return '#3182ce'; // Blue
    if (percentage >= 50) return '#d69e2e'; // Orange
    return '#e53e3e'; // Red
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#e53e3e';
      case 'high': return '#dd6b20';
      case 'medium': return '#d69e2e';
      default: return '#38a169';
    }
  }

  private getRiskColor(status: string): string {
    switch (status) {
      case 'critical': return '#e53e3e';
      case 'needs_attention': return '#dd6b20';
      case 'good': return '#3182ce';
      case 'excellent': return '#38a169';
      default: return '#718096';
    }
  }
}

export default ReportGenerator;