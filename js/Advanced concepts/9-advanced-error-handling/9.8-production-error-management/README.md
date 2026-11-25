# **9.8 Production Error Management**

Production error management involves systematic approaches to handling, monitoring, and learning from errors in live environments to maintain system reliability and user satisfaction.

## Error Budgets and SLA Management

### Error Budget Implementation

```javascript
class ErrorBudgetManager {
  constructor(options = {}) {
    this.slaTarget = options.slaTarget || 0.999; // 99.9% uptime
    this.timeWindow = options.timeWindow || 30 * 24 * 60 * 60 * 1000; // 30 days
    this.errorEvents = [];
    this.totalRequests = 0;
  }
  
  recordRequest(success = true) {
    this.totalRequests++;
    
    if (!success) {
      this.errorEvents.push({
        timestamp: Date.now(),
        type: 'error'
      });
    }
    
    this.cleanupOldEvents();
  }
  
  cleanupOldEvents() {
    const cutoff = Date.now() - this.timeWindow;
    this.errorEvents = this.errorEvents.filter(event => event.timestamp > cutoff);
  }
  
  getCurrentErrorRate() {
    if (this.totalRequests === 0) return 0;
    return this.errorEvents.length / this.totalRequests;
  }
  
  getRemainingErrorBudget() {
    const allowedErrorRate = 1 - this.slaTarget;
    const currentErrorRate = this.getCurrentErrorRate();
    return Math.max(0, allowedErrorRate - currentErrorRate);
  }
  
  getErrorBudgetStatus() {
    const remaining = this.getRemainingErrorBudget();
    const allowedErrorRate = 1 - this.slaTarget;
    const percentageRemaining = (remaining / allowedErrorRate) * 100;
    
    return {
      remaining: percentageRemaining,
      status: percentageRemaining > 50 ? 'healthy' : 
              percentageRemaining > 10 ? 'warning' : 'critical',
      currentErrorRate: this.getCurrentErrorRate(),
      allowedErrorRate,
      totalRequests: this.totalRequests,
      errorCount: this.errorEvents.length
    };
  }
  
  shouldBlockDeployment() {
    const status = this.getErrorBudgetStatus();
    return status.status === 'critical';
  }
}

// Usage
const errorBudget = new ErrorBudgetManager({
  slaTarget: 0.995, // 99.5% uptime
  timeWindow: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Record requests
errorBudget.recordRequest(true);  // Success
errorBudget.recordRequest(false); // Error
errorBudget.recordRequest(true);  // Success

console.log('Error budget status:', errorBudget.getErrorBudgetStatus());
```

### SLA Monitoring Dashboard

```javascript
class SLAMonitor {
  constructor() {
    this.services = new Map();
    this.alerts = [];
  }
  
  addService(name, slaTarget) {
    this.services.set(name, {
      name,
      slaTarget,
      errorBudget: new ErrorBudgetManager({ slaTarget }),
      incidents: [],
      lastIncident: null
    });
  }
  
  recordServiceRequest(serviceName, success, responseTime) {
    const service = this.services.get(serviceName);
    if (!service) return;
    
    service.errorBudget.recordRequest(success);
    
    if (!success) {
      this.handleServiceError(serviceName, responseTime);
    }
  }
  
  handleServiceError(serviceName, responseTime) {
    const service = this.services.get(serviceName);
    const budgetStatus = service.errorBudget.getErrorBudgetStatus();
    
    if (budgetStatus.status === 'critical') {
      this.triggerAlert(serviceName, 'SLA_BREACH', {
        errorRate: budgetStatus.currentErrorRate,
        budgetRemaining: budgetStatus.remaining
      });
    }
  }
  
  triggerAlert(serviceName, type, details) {
    const alert = {
      id: Date.now(),
      serviceName,
      type,
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.push(alert);
    console.error(`🚨 SLA Alert: ${serviceName} - ${type}`, details);
    
    // Send to alerting system
    this.sendAlert(alert);
  }
  
  async sendAlert(alert) {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
  
  getSLAReport() {
    const report = {};
    
    for (const [name, service] of this.services) {
      const budgetStatus = service.errorBudget.getErrorBudgetStatus();
      report[name] = {
        slaTarget: service.slaTarget,
        currentUptime: (1 - budgetStatus.currentErrorRate) * 100,
        errorBudgetRemaining: budgetStatus.remaining,
        status: budgetStatus.status,
        totalRequests: budgetStatus.totalRequests,
        errorCount: budgetStatus.errorCount
      };
    }
    
    return report;
  }
}
```

## Incident Response Procedures

### Automated Incident Detection

```javascript
class IncidentManager {
  constructor() {
    this.incidents = new Map();
    this.escalationRules = [];
    this.responseTeam = [];
  }
  
  addEscalationRule(condition, action, delay = 0) {
    this.escalationRules.push({ condition, action, delay });
  }
  
  createIncident(type, severity, details) {
    const incident = {
      id: `INC-${Date.now()}`,
      type,
      severity,
      details,
      status: 'open',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      timeline: [{
        timestamp: new Date().toISOString(),
        action: 'created',
        details: `Incident created: ${type}`
      }]
    };
    
    this.incidents.set(incident.id, incident);
    this.processEscalation(incident);
    
    return incident;
  }
  
  processEscalation(incident) {
    for (const rule of this.escalationRules) {
      if (rule.condition(incident)) {
        if (rule.delay > 0) {
          setTimeout(() => {
            if (this.incidents.get(incident.id)?.status === 'open') {
              rule.action(incident);
            }
          }, rule.delay);
        } else {
          rule.action(incident);
        }
      }
    }
  }
  
  updateIncident(incidentId, update) {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;
    
    Object.assign(incident, update);
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      action: 'updated',
      details: JSON.stringify(update)
    });
    
    return incident;
  }
  
  resolveIncident(incidentId, resolution) {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;
    
    incident.status = 'resolved';
    incident.resolvedAt = new Date().toISOString();
    incident.resolution = resolution;
    
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      action: 'resolved',
      details: resolution
    });
    
    return incident;
  }
  
  getActiveIncidents() {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status === 'open');
  }
  
  getIncidentMetrics() {
    const incidents = Array.from(this.incidents.values());
    const resolved = incidents.filter(i => i.status === 'resolved');
    
    return {
      total: incidents.length,
      active: incidents.filter(i => i.status === 'open').length,
      resolved: resolved.length,
      averageResolutionTime: this.calculateAverageResolutionTime(resolved),
      severityBreakdown: this.getSeverityBreakdown(incidents)
    };
  }
  
  calculateAverageResolutionTime(resolvedIncidents) {
    if (resolvedIncidents.length === 0) return 0;
    
    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      const created = new Date(incident.createdAt);
      const resolved = new Date(incident.resolvedAt);
      return sum + (resolved - created);
    }, 0);
    
    return totalTime / resolvedIncidents.length;
  }
  
  getSeverityBreakdown(incidents) {
    const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(incident => {
      breakdown[incident.severity] = (breakdown[incident.severity] || 0) + 1;
    });
    return breakdown;
  }
}

// Setup incident management
const incidentManager = new IncidentManager();

// Add escalation rules
incidentManager.addEscalationRule(
  (incident) => incident.severity === 'critical',
  (incident) => {
    console.log(`🚨 CRITICAL INCIDENT: ${incident.id}`);
    // Page on-call engineer immediately
    pageOnCallEngineer(incident);
  }
);

incidentManager.addEscalationRule(
  (incident) => incident.severity === 'high',
  (incident) => {
    console.log(`⚠️ HIGH SEVERITY INCIDENT: ${incident.id}`);
    // Notify team lead
    notifyTeamLead(incident);
  },
  5 * 60 * 1000 // 5 minutes delay
);

// Auto-create incidents from error patterns
function detectAndCreateIncident(errorPattern) {
  if (errorPattern.count > 100 && errorPattern.timeWindow < 300000) {
    incidentManager.createIncident(
      'high_error_rate',
      'high',
      {
        errorType: errorPattern.type,
        count: errorPattern.count,
        timeWindow: errorPattern.timeWindow,
        affectedServices: errorPattern.services
      }
    );
  }
}
```

## Error Analysis and Root Cause Analysis

### Automated Error Pattern Detection

```javascript
class ErrorPatternAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.analysisWindow = 5 * 60 * 1000; // 5 minutes
    this.thresholds = {
      errorSpike: { count: 50, timeWindow: 60000 },
      errorRate: { rate: 0.05, timeWindow: 300000 },
      newError: { count: 5, timeWindow: 300000 }
    };
  }
  
  analyzeError(error) {
    const pattern = this.getOrCreatePattern(error);
    pattern.occurrences.push({
      timestamp: Date.now(),
      error: this.sanitizeError(error)
    });
    
    this.cleanupOldOccurrences(pattern);
    this.checkForAnomalies(pattern);
  }
  
  getOrCreatePattern(error) {
    const key = this.generatePatternKey(error);
    
    if (!this.patterns.has(key)) {
      this.patterns.set(key, {
        key,
        type: error.name,
        message: error.message,
        stack: this.getStackSignature(error.stack),
        occurrences: [],
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        severity: 'medium'
      });
    }
    
    const pattern = this.patterns.get(key);
    pattern.lastSeen = Date.now();
    return pattern;
  }
  
  generatePatternKey(error) {
    // Create a unique key based on error type and stack trace
    const stackSignature = this.getStackSignature(error.stack);
    return `${error.name}:${stackSignature}`;
  }
  
  getStackSignature(stack) {
    if (!stack) return 'no-stack';
    
    // Extract meaningful parts of stack trace
    const lines = stack.split('\n').slice(0, 3);
    return lines
      .map(line => line.replace(/:\d+:\d+/g, '')) // Remove line numbers
      .join('|');
  }
  
  sanitizeError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    };
  }
  
  cleanupOldOccurrences(pattern) {
    const cutoff = Date.now() - this.analysisWindow;
    pattern.occurrences = pattern.occurrences.filter(
      occurrence => occurrence.timestamp > cutoff
    );
  }
  
  checkForAnomalies(pattern) {
    const recentOccurrences = pattern.occurrences.filter(
      occ => Date.now() - occ.timestamp < this.thresholds.errorSpike.timeWindow
    );
    
    // Check for error spike
    if (recentOccurrences.length >= this.thresholds.errorSpike.count) {
      this.reportAnomaly('error_spike', pattern, {
        count: recentOccurrences.length,
        timeWindow: this.thresholds.errorSpike.timeWindow
      });
    }
    
    // Check for new error pattern
    if (pattern.occurrences.length >= this.thresholds.newError.count &&
        Date.now() - pattern.firstSeen < this.thresholds.newError.timeWindow) {
      this.reportAnomaly('new_error_pattern', pattern, {
        count: pattern.occurrences.length,
        age: Date.now() - pattern.firstSeen
      });
    }
  }
  
  reportAnomaly(type, pattern, details) {
    const anomaly = {
      type,
      pattern: pattern.key,
      errorType: pattern.type,
      message: pattern.message,
      details,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(type, details)
    };
    
    console.warn(`🔍 Error Anomaly Detected: ${type}`, anomaly);
    this.sendAnomalyAlert(anomaly);
  }
  
  calculateSeverity(type, details) {
    if (type === 'error_spike' && details.count > 100) return 'critical';
    if (type === 'new_error_pattern' && details.count > 20) return 'high';
    return 'medium';
  }
  
  async sendAnomalyAlert(anomaly) {
    try {
      await fetch('/api/anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anomaly)
      });
    } catch (error) {
      console.error('Failed to send anomaly alert:', error);
    }
  }
  
  getTopErrorPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.occurrences.length - a.occurrences.length)
      .slice(0, limit)
      .map(pattern => ({
        key: pattern.key,
        type: pattern.type,
        message: pattern.message,
        count: pattern.occurrences.length,
        firstSeen: new Date(pattern.firstSeen).toISOString(),
        lastSeen: new Date(pattern.lastSeen).toISOString()
      }));
  }
  
  generateReport() {
    const patterns = Array.from(this.patterns.values());
    
    return {
      totalPatterns: patterns.length,
      totalOccurrences: patterns.reduce((sum, p) => sum + p.occurrences.length, 0),
      topPatterns: this.getTopErrorPatterns(5),
      severityBreakdown: this.getSeverityBreakdown(patterns),
      timeRange: {
        from: new Date(Date.now() - this.analysisWindow).toISOString(),
        to: new Date().toISOString()
      }
    };
  }
  
  getSeverityBreakdown(patterns) {
    const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
    patterns.forEach(pattern => {
      breakdown[pattern.severity]++;
    });
    return breakdown;
  }
}

// Usage
const errorAnalyzer = new ErrorPatternAnalyzer();

// Integrate with global error handler
window.addEventListener('error', (event) => {
  errorAnalyzer.analyzeError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  errorAnalyzer.analyzeError(event.reason);
});

// Generate periodic reports
setInterval(() => {
  const report = errorAnalyzer.generateReport();
  console.log('Error Analysis Report:', report);
}, 5 * 60 * 1000); // Every 5 minutes
```

## Best Practices Summary

### Do's

```javascript
// ✅ Implement comprehensive error budgets
const errorBudget = new ErrorBudgetManager({
  slaTarget: 0.999,
  timeWindow: 30 * 24 * 60 * 60 * 1000
});

// ✅ Set up automated incident detection
incidentManager.addEscalationRule(
  (incident) => incident.severity === 'critical',
  (incident) => pageOnCallEngineer(incident)
);

// ✅ Analyze error patterns for insights
errorAnalyzer.analyzeError(error);
const patterns = errorAnalyzer.getTopErrorPatterns();

// ✅ Monitor SLA compliance continuously
const slaReport = slaMonitor.getSLAReport();
```

### Don'ts

```javascript
// ❌ Don't ignore error budget depletion
if (errorBudget.shouldBlockDeployment()) {
  // Don't deploy when error budget is exhausted
  throw new Error('Deployment blocked: Error budget exhausted');
}

// ❌ Don't let incidents go unnoticed
// Always have automated detection and alerting

// ❌ Don't skip root cause analysis
// Every incident should have proper analysis and follow-up
```

## Key Takeaways

* **Implement error budgets** to balance reliability and feature velocity
* **Set up automated incident detection** and escalation procedures
* **Analyze error patterns** to identify systemic issues
* **Monitor SLA compliance** continuously
* **Have clear incident response procedures** with defined roles
* **Perform root cause analysis** for all significant incidents
* **Use data-driven approaches** for error management decisions
* **Continuously improve** based on incident learnings
