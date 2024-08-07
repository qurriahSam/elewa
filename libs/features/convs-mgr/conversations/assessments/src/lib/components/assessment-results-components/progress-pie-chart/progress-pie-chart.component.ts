import Chart from 'chart.js/auto';

import { Component, OnInit, OnDestroy, Input, AfterContentInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

import { SubSink } from 'subsink';

import { AssessmentResult, PieChartData } from '@app/model/convs-mgr/micro-app/assessments';

@Component({
  selector: 'app-progress-pie-chart',
  templateUrl: './progress-pie-chart.component.html',
  styleUrls: ['./progress-pie-chart.component.scss'],
})
export class ProgressPieChartComponent implements OnInit, AfterViewInit,OnDestroy {
  id: string;
  @ViewChild('progressPieChart') progressPieChart: ElementRef;
  @Input() assessmentResults: AssessmentResult;

  chart: Chart;
  total = 0;
  private _sBs = new SubSink();

  constructor(private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
      const statuses = Object.keys(this.assessmentResults.pieChartData);

      for(const status of statuses) {
        this.total += this.assessmentResults.pieChartData[status as keyof PieChartData] || 0;
      }
  }

  ngAfterViewInit() {
    Chart.defaults.color = '#000';
    this.chart = this._loadChart(this.assessmentResults.pieChartData) as any;
    this.cdr.detectChanges();
  }

  private _loadChart(data: PieChartData) {
    if (this.chart) {
      this.chart.destroy();
    }

    return new Chart(this.progressPieChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Done', 'In progress', 'Not started'],
        datasets: [
          {
            data: [data.done, data.inProgress, 0],
            backgroundColor: ["#3E788A","#50BEA5", "#F3F3F3"],
            borderWidth: 0
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Progress chart',
            font: {size: 14, weight: 'normal'}
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12,
              useBorderRadius: true,
              borderRadius: 6
            },
          },
        }
      },
    });
  }
  ngOnDestroy() {
    this._sBs.unsubscribe();
  }
}
