import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

interface Metrics {
  sales: number;
  userCount: number;
  systemLoad: number;
  salesChange: number;
  userChange: number;
  loadChange: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Analytics Dashboard</h1>
        <p class="last-updated">Last updated: {{ lastUpdated | date:'medium' }}</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>Total Sales</h3>
            <p class="metric-value">\${{ metrics.sales | number:'1.0-0' }}</p>
            <span class="metric-change" [class.positive]="metrics.salesChange > 0" [class.negative]="metrics.salesChange < 0">
              {{ metrics.salesChange > 0 ? '+' : '' }}{{ metrics.salesChange | number:'1.1-1' }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <h3>Total Users</h3>
            <p class="metric-value">{{ metrics.userCount | number:'1.0-0' }}</p>
            <span class="metric-change" [class.positive]="metrics.userChange > 0" [class.negative]="metrics.userChange < 0">
              {{ metrics.userChange > 0 ? '+' : '' }}{{ metrics.userChange | number:'1.1-1' }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <h3>System Load</h3>
            <p class="metric-value">{{ metrics.systemLoad | number:'1.1-1' }}%</p>
            <span class="metric-change" [class.positive]="metrics.loadChange > 0" [class.negative]="metrics.loadChange < 0">
              {{ metrics.loadChange > 0 ? '+' : '' }}{{ metrics.loadChange | number:'1.1-1' }}%
            </span>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h3>Sales Overview</h3>
          <canvas baseChart
            [data]="salesChartData"
            [options]="salesChartOptions"
            [type]="salesChartType">
          </canvas>
        </div>

        <div class="chart-card">
          <h3>User Growth</h3>
          <canvas baseChart
            [data]="userChartData"
            [options]="userChartOptions"
            [type]="userChartType">
          </canvas>
        </div>

        <div class="chart-card">
          <h3>System Performance</h3>
          <canvas baseChart
            [data]="systemChartData"
            [options]="systemChartOptions"
            [type]="systemChartType">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .dashboard-header h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .last-updated {
      color: #666;
      font-size: 0.9rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .metric-icon {
      font-size: 2rem;
    }

    .metric-content h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
      color: #333;
    }

    .metric-change {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-change.positive {
      color: #22c55e;
    }

    .metric-change.negative {
      color: #ef4444;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .chart-card canvas {
      max-height: 300px;
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private socketService = inject(SocketService);

  metrics: Metrics = {
    sales: 0,
    userCount: 0,
    systemLoad: 0,
    salesChange: 0,
    userChange: 0,
    loadChange: 0
  };

  lastUpdated = new Date();

  // Sales Chart
  salesChartType: ChartType = 'line';
  salesChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Sales ($)',
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  };
  salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // User Chart
  userChartType: ChartType = 'bar';
  userChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Users',
      backgroundColor: '#10b981'
    }]
  };
  userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // System Chart
  systemChartType: ChartType = 'doughnut';
  systemChartData: ChartConfiguration['data'] = {
    labels: ['CPU', 'Memory', 'Disk'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6']
    }]
  };
  systemChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  private updateInterval: any;

  ngOnInit() {
    this.loadInitialData();
    this.setupRealTimeUpdates();
    this.updateInterval = setInterval(() => {
      this.lastUpdated = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.socketService.disconnect();
  }

  private loadInitialData() {
    // Load initial metrics data
    this.loadMetrics();
    this.loadChartData();
  }

  private setupRealTimeUpdates() {
    // Connect to admin socket room
    this.socketService.emit('admin:join');

    // Listen for real-time updates
    this.socketService.on('metrics:update', (data: Partial<Metrics>) => {
      this.updateMetrics(data);
    });

    this.socketService.on('sales:update', (data: any) => {
      this.updateSalesChart(data);
    });

    this.socketService.on('users:update', (data: any) => {
      this.updateUserChart(data);
    });

    this.socketService.on('system:update', (data: any) => {
      this.updateSystemChart(data);
    });
  }

  private loadMetrics() {
    // Simulate loading metrics - replace with actual API calls
    this.metrics = {
      sales: 45230,
      userCount: 1234,
      systemLoad: 45.2,
      salesChange: 12.5,
      userChange: 8.3,
      loadChange: -2.1
    };
  }

  private loadChartData() {
    // Sales chart data
    const salesLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const salesData = [12000, 15000, 18000, 22000, 25000, 28000];
    this.salesChartData.labels = salesLabels;
    this.salesChartData.datasets[0].data = salesData;

    // User chart data
    const userLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const userData = [280, 320, 290, 344];
    this.userChartData.labels = userLabels;
    this.userChartData.datasets[0].data = userData;

    // System chart data
    this.systemChartData.datasets[0].data = [45, 60, 25];
  }

  private updateMetrics(data: Partial<Metrics>) {
    this.metrics = { ...this.metrics, ...data };
  }

  private updateSalesChart(data: any) {
    // Update sales chart with new data
    if (data.labels && data.values) {
      this.salesChartData.labels = data.labels;
      this.salesChartData.datasets[0].data = data.values;
    }
  }

  private updateUserChart(data: any) {
    // Update user chart with new data
    if (data.labels && data.values) {
      this.userChartData.labels = data.labels;
      this.userChartData.datasets[0].data = data.values;
    }
  }

  private updateSystemChart(data: any) {
    // Update system chart with new data
    if (data.cpu !== undefined && data.memory !== undefined && data.disk !== undefined) {
      this.systemChartData.datasets[0].data = [data.cpu, data.memory, data.disk];
    }
  }
}