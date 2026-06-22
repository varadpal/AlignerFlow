import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getLastNDays, formatMinutesToDisplay, formatMinutesToHours, formatDateDisplay, calculateStreak } from '../utils/timeFormatters';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './ReportPage.css';

export default function ReportPage() {
  const { user, userProfile } = useAuth();
  const [period, setPeriod] = useState('week');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const goalHours = userProfile?.dailyWearGoalHours || 22;

  useEffect(() => {
    if (user) generateReport();
  }, [user, period]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const days = getLastNDays(period === 'week' ? 7 : 30);
      const summariesRef = collection(db, 'users', user.uid, 'dailySummaries');
      const snapshot = await getDocs(summariesRef);
      const summaryMap = {};
      snapshot.forEach(doc => {
        summaryMap[doc.id] = doc.data();
      });

      const daysWithData = days.filter(d => summaryMap[d]);
      const totalDays = daysWithData.length;

      if (totalDays === 0) {
        setReportData({ empty: true });
        setLoading(false);
        return;
      }

      const wearTimes = daysWithData.map(d => summaryMap[d].totalWearMinutes || 0);
      const avgWear = wearTimes.reduce((a, b) => a + b, 0) / totalDays;
      const bestDay = Math.max(...wearTimes);
      const worstDay = Math.min(...wearTimes);
      const daysOnGoal = daysWithData.filter(d => summaryMap[d].goalMet).length;
      const complianceRate = Math.round((daysOnGoal / totalDays) * 100);

      // Best day date
      const bestDayDate = daysWithData[wearTimes.indexOf(bestDay)];
      const worstDayDate = daysWithData[wearTimes.indexOf(worstDay)];

      // Streak
      const streak = calculateStreak(summaryMap, days);

      setReportData({
        empty: false,
        period: period === 'week' ? 'Weekly' : 'Monthly',
        periodRange: `${formatDateDisplay(days[0])} — ${formatDateDisplay(days[days.length - 1])}`,
        totalDays,
        avgWear,
        bestDay,
        bestDayDate,
        worstDay,
        worstDayDate,
        daysOnGoal,
        complianceRate,
        streak,
        goalHours,
        currentTray: userProfile?.currentTray,
        totalTrays: userProfile?.totalTrays
      });
    } catch (err) {
      console.error('Report error:', err);
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    const card = document.getElementById('report-card');
    if (!card) return;
    
    try {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bgColor = isDark ? '#000000' : '#ffffff';
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: bgColor });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`AlignerFlow_${reportData.period}_Report.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  const handleShare = async () => {
    const card = document.getElementById('report-card');
    if (!card) return;

    try {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bgColor = isDark ? '#000000' : '#ffffff';
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: bgColor });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `alignerflow_report.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My AlignerFlow Report',
            text: 'Check out my clear aligner progress!',
            files: [file]
          });
        } else {
          // Fallback if sharing is not supported: trigger a download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'alignerflow_report.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const snapshot = await getDocs(sessionsRef);
      
      const rows = [
        ['Date', 'Start Time', 'End Time', 'Duration (Minutes)', 'Type', 'Manual Entry', 'Note']
      ];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const start = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
        const end = data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime);
        
        rows.push([
          data.date || '',
          start.toLocaleTimeString() || '',
          end.toLocaleTimeString() || '',
          data.durationMinutes || 0,
          data.type || 'removal',
          data.isManual ? 'Yes' : 'No',
          `"${data.note || ''}"`
        ]);
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "AlignerFlow_Raw_Sessions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV export failed', err);
    }
  };

  return (
    <div className="report-page" id="report-page">
      <Header />
      <div className="page">
        <div className="page-inner">
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-xs)' }}>Reports</h1>
          <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Your wear time analysis at a glance
          </p>

          {/* Period Tabs */}
          <div className="analytics__tabs">
            <button
              className={`analytics__tab ${period === 'week' ? 'analytics__tab--active' : ''}`}
              onClick={() => setPeriod('week')}
              id="report-tab-week"
            >
              This Week
            </button>
            <button
              className={`analytics__tab ${period === 'month' ? 'analytics__tab--active' : ''}`}
              onClick={() => setPeriod('month')}
              id="report-tab-month"
            >
              This Month
            </button>
          </div>

          {loading ? (
            <div className="analytics__loading">
              <div className="analytics__spinner" />
            </div>
          ) : reportData?.empty ? (
            <div className="report__empty card">
              <p className="text-body" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                📊 No data yet for this period.<br />Start tracking to see your report!
              </p>
            </div>
          ) : (
            <div className="animate-fade-in-up stagger">
              {/* Report Card */}
              <div className="report__card card" id="report-card">
                <div className="report__card-header">
                  <div>
                    <div className="text-label" style={{ color: 'var(--accent)', marginBottom: '4px' }}>
                      {reportData.period} Report
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                      {reportData.periodRange}
                    </div>
                  </div>
                  <div className="report__compliance">
                    <div className="report__compliance-value">{reportData.complianceRate}%</div>
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>compliance</div>
                  </div>
                </div>

                <div className="report__divider" />

                <div className="report__metrics">
                  <div className="report__metric">
                    <div className="report__metric-label text-caption">Avg. Daily Wear</div>
                    <div className="report__metric-value">{formatMinutesToDisplay(reportData.avgWear)}</div>
                  </div>
                  <div className="report__metric">
                    <div className="report__metric-label text-caption">Best Day</div>
                    <div className="report__metric-value" style={{ color: 'var(--success)' }}>
                      {formatMinutesToDisplay(reportData.bestDay)}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                      {formatDateDisplay(reportData.bestDayDate)}
                    </div>
                  </div>
                  <div className="report__metric">
                    <div className="report__metric-label text-caption">Worst Day</div>
                    <div className="report__metric-value" style={{ color: 'var(--danger)' }}>
                      {formatMinutesToDisplay(reportData.worstDay)}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                      {formatDateDisplay(reportData.worstDayDate)}
                    </div>
                  </div>
                  <div className="report__metric">
                    <div className="report__metric-label text-caption">Days on Goal</div>
                    <div className="report__metric-value">
                      {reportData.daysOnGoal} / {reportData.totalDays}
                    </div>
                  </div>
                  <div className="report__metric">
                    <div className="report__metric-label text-caption">Current Streak</div>
                    <div className="report__metric-value">
                      🔥 {reportData.streak} days
                    </div>
                  </div>
                  {reportData.currentTray && (
                    <div className="report__metric">
                      <div className="report__metric-label text-caption">Treatment Progress</div>
                      <div className="report__metric-value">
                        Tray {reportData.currentTray} / {reportData.totalTrays}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="report__actions">
                <button className="btn btn--primary btn--full" id="share-report" onClick={handleShare}>
                  📤 Share Report
                </button>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn--secondary btn--full" id="export-pdf" onClick={handleExportPDF}>
                    📄 Export PDF
                  </button>
                  <button className="btn btn--secondary btn--full" id="export-csv" onClick={handleExportCSV}>
                    📊 Export CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
