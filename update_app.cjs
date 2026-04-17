const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'resources/js/App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Pagination & Stats States
content = content.replace(
  `  const [proposals, setProposals] = useState([]);\n  const [logs, setLogs] = useState([]);`,
  `  const [proposals, setProposals] = useState([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const [totalPages, setTotalPages] = useState(1);\n  const [totalItems, setTotalItems] = useState(0);\n  const [dashboardStats, setDashboardStats] = useState(null);\n  const [logs, setLogs] = useState([]);\n  const [logsCurrentPage, setLogsCurrentPage] = useState(1);\n  const [logsTotalPages, setLogsTotalPages] = useState(1);`
);

// 2. Remove frontend `filteredProposals` filtering and create handleFilterChange
let filterLogicSearch = `const filteredProposals = proposals.filter(p => {\n    const q = searchQuery.toLowerCase();\n    const matchSearch = !q || (\n      (p.kode_tiket || '').toLowerCase().includes(q) ||\n      (p.user?.name || '').toLowerCase().includes(q) ||\n      (p.kegiatan || '').toLowerCase().includes(q) ||\n      (p.jenis || '').toLowerCase().includes(q)\n    );\n    const matchStatus = !filterStatus || p.status === filterStatus;\n    const matchDateFrom = !filterDateFrom || p.tgl_pelaksanaan >= filterDateFrom;\n    const matchDateTo = !filterDateTo || p.tgl_pelaksanaan <= filterDateTo;\n    return matchSearch && matchStatus && matchDateFrom && matchDateTo;\n  });`;

content = content.replace(filterLogicSearch, `const filteredProposals = proposals; // Filtered in backend\n\n  // Trigger fetch when filters change\n  useEffect(() => {\n    if (activeRole) fetchProposals(1);\n  }, [searchQuery, filterStatus, filterDateFrom, filterDateTo]);`);

// 3. Update RenderSearchBar buttons to use totalItems
content = content.replace(
  `<span className="filter-count">{filteredProposals.length} dari {proposals.length} data</span>`,
  `<span className="filter-count">Menampilkan {proposals.length} dari total {totalItems} data</span>`
);

// 4. Update fetchProposals and fetchLogs and add fetchStats
let oldFetchProposals = `const fetchProposals = async () => {\n    try {\n      const res = await axios.get('/api/proposals');\n      setProposals(res.data.data);\n    } catch (e) { }\n  };\n\n  const fetchLogs = async () => {\n    try {\n      const res = await axios.get('/api/logs');\n      setLogs(res.data.data);\n    } catch (e) { }\n  };`;

let newFetchers = `const fetchStats = async () => {\n    try {\n      const q = chartFilterMonth ? \`?month=\${chartFilterMonth}\` : '';\n      const res = await axios.get(\`/api/proposals/stats\${q}\`);\n      setDashboardStats(res.data.data);\n    } catch (e) { }\n  };\n\n  const fetchProposals = async (page = 1) => {\n    try {\n      const q = searchQuery ? \`&search=\${encodeURIComponent(searchQuery)}\` : '';\n      const fStatus = filterStatus ? \`&status=\${encodeURIComponent(filterStatus)}\` : '';\n      const fDateF = filterDateFrom ? \`&date_from=\${encodeURIComponent(filterDateFrom)}\` : '';\n      const fDateT = filterDateTo ? \`&date_to=\${encodeURIComponent(filterDateTo)}\` : '';\n      const res = await axios.get(\`/api/proposals?page=\${page}\${q}\${fStatus}\${fDateF}\${fDateT}\`);\n      setProposals(res.data.data.data || []);\n      setCurrentPage(res.data.data.current_page || 1);\n      setTotalPages(res.data.data.last_page || 1);\n      setTotalItems(res.data.data.total || 0);\n    } catch (e) { }\n  };\n\n  const fetchLogs = async (page = 1) => {\n    try {\n      const res = await axios.get(\`/api/logs?page=\${page}\`);\n      setLogs(res.data.data.data || []);\n      setLogsCurrentPage(res.data.data.current_page || 1);\n      setLogsTotalPages(res.data.data.last_page || 1);\n    } catch (e) { }\n  };`;
content = content.replace(oldFetchProposals, newFetchers);

// 5. Make activePage effect run fetchStats
content = content.replace(
  `useEffect(() => {\n    if (activePage === 'logs') {\n      fetchLogs();\n    }\n  }, [activePage]);`,
  `useEffect(() => {\n    if (activePage === 'logs') {\n      fetchLogs();\n    }\n    if (activePage === 'dashboard') {\n      fetchStats();\n    }\n  }, [activePage, chartFilterMonth]);`
);

// 6. Handle CSV Export
let oldCsvExportRegex = /const handleExportCSV = \(data, filename\) => \{[\s\S]*?showToast\('Data berhasil diekspor ke CSV!'\);\n  \};/;
let newCsvExport = `const handleExportCSV = async (filename) => {
    try {
      const q = searchQuery ? \`&search=\${encodeURIComponent(searchQuery)}\` : '';
      const fStatus = filterStatus ? \`&status=\${encodeURIComponent(filterStatus)}\` : '';
      const fDateF = filterDateFrom ? \`&date_from=\${encodeURIComponent(filterDateFrom)}\` : '';
      const fDateT = filterDateTo ? \`&date_to=\${encodeURIComponent(filterDateTo)}\` : '';
      const res = await axios.get(\`/api/proposals?export=1\${q}\${fStatus}\${fDateF}\${fDateT}\`);
      const data = res.data.data;
      if (!data || data.length === 0) {
        showToast('Tidak ada data untuk diekspor');
        return;
      }
      const headers = ['Kode Tiket', 'Pemohon', 'Instansi', 'Kegiatan', 'Jenis', 'Tanggal Pelaksanaan', 'Dana Diajukan (Rp)', 'Status', 'Nama Bank', 'Nomor Rekening'];
      const csvContent = [
        headers.join(','),
        ...data.map(p => {
          const row = [ p.kode_tiket, p.user?.name || '', p.user?.instansi || '', p.kegiatan, p.jenis, p.tgl_pelaksanaan, p.dana_diajukan, p.status, p.nama_bank || '', p.nomor_rekening || '' ];
          return row.map(val => \`"\${String(val).replace(/"/g, '""')}"\`).join(',');
        })
      ].join('\\n');
      const blob = new Blob(['\\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', \`\${filename}_\${new Date().toISOString().split('T')[0]}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data berhasil diekspor ke CSV!');
    } catch (e) {
      showToast('Gagal mengekspor data');
    }
  };`;
content = content.replace(oldCsvExportRegex, newCsvExport);

// 7. Update Handle Export CSV Call
content = content.replace(/handleExportCSV\(filteredProposals, 'daftar_proposal'\)/g, `handleExportCSV('daftar_proposal')`);
content = content.replace(/handleExportCSV\(filteredProposals, 'master_database'\)/g, `handleExportCSV('master_database')`);

// 8. Update Chart Data logic
let oldChartStatusRegex = /const chartDataStatus = useMemo\(\(\) => \{[\s\S]*?\}, \[proposals, chartFilterMonth\]\);/;
let newChartStatus = `const chartDataStatus = useMemo(() => {
    if (!dashboardStats) return [];
    return Object.keys(dashboardStats.status_counts).map(key => ({ name: key, value: dashboardStats.status_counts[key] }));
  }, [dashboardStats]);`;
content = content.replace(oldChartStatusRegex, newChartStatus);

let oldChartMonthlyRegex = /const chartDataMonthly = useMemo\(\(\) => \{[\s\S]*?\}, \[proposals, chartFilterMonth\]\);/;
let newChartMonthly = `const chartDataMonthly = useMemo(() => {
    if (!dashboardStats) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const data = months.map((m, idx) => ({ name: m, total: dashboardStats.monthly_counts[idx + 1] || 0 }));
    return data;
  }, [dashboardStats]);`;
content = content.replace(oldChartMonthlyRegex, newChartMonthly);

// 9. Update Dashboard Stats usage
content = content.replace(/\{proposals\.filter\(p => p\.status !== 'Selesai'\)\.length\}/g, `{dashboardStats?.total_queue || 0}`);
content = content.replace(/\{proposals\.filter\(p => p\.status === 'Dalam Review'\)\.length\}/g, `{dashboardStats?.total_review || 0}`);
content = content.replace(/\{proposals\.filter\(p => p\.status === 'Menunggu Evidence'\)\.length\}/g, `{dashboardStats?.total_evidence || 0}`);
content = content.replace(/\{proposals\.filter\(p => p\.status === 'Selesai'\)\.length\}/g, `{dashboardStats?.total_selesai || 0}`);

// 10. Update Render Pagination UI Component String and append to tables
const renderPaginationStr = `\n\n  const renderPagination = (currPage, totPage, handleFetch) => {
    if (totPage <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '16px 0', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-d btn-sm" disabled={currPage === 1} onClick={() => handleFetch(currPage - 1)}>← Sebelumnya</button>
        <span style={{ fontSize: '13px', color: 'var(--t2)', fontWeight: 500 }}>Halaman {currPage} dari {totPage}</span>
        <button className="btn btn-d btn-sm" disabled={currPage === totPage} onClick={() => handleFetch(currPage + 1)}>Selanjutnya →</button>
      </div>
    );
  };\n\n`;

content = content.replace(`export default function App() {`, `export default function App() {\n${renderPaginationStr}`);

content = content.replace(
  /<\/tbody>\n\s*<\/table>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/g,
  `</tbody>\n              </table>\n              {renderPagination(currentPage, totalPages, fetchProposals)}\n            </div>\n          </div>\n        )}`
);

// Oh wait, for Logs it should use logsCurrentPage and fetchLogs!
const logsReplacement = `</tbody>\n              </table>\n              {renderPagination(logsCurrentPage, logsTotalPages, fetchLogs)}\n            </div>\n          </div>\n        )}`;
content = content.replace(
  /<\/tbody>\n\s*<\/table>\n\s*<\/div>\n\s*<\/div>\n\s*\)}\n\s*<\/main>/,
  `${logsReplacement}\n      </main>`
);

/* One fix: user proposals length in menu */
content = content.replace(/<span className="ni-c">\{proposals\.length\}<\/span>/, `<span className="ni-c">{totalItems}</span>`);
content = content.replace(/<span className="ni-c">\{proposals\.filter\(p => p\.status === 'Menunggu Verif'\)\.length\}<\/span>/, `<span className="ni-c">{dashboardStats?.total_evidence || 0}</span>`);


fs.writeFileSync(file, content);
console.log('App.jsx updated successfully.');
