import { useState } from 'react';
import { Terminal, Database, ShieldAlert, Activity, Play, AlertTriangle, Cpu, Copy, Calendar, MapPin } from 'lucide-react';

export default function AutomationsTab() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [terminalLogs, setTerminalLogs] = useState<string>('Pronto para executar scripts. Aguardando comandos...\n');
  const [error, setError] = useState<string | null>(null);

  // Estados para o Modal do PIN da Base de Dados
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingScript, setPendingScript] = useState<string | null>(null);

  const requestAutomation = (scriptName: string) => {
    setPendingScript(scriptName);
    setPinInput('');
    setIsPinModalOpen(true);
  };

  const executeAutomation = async () => {
    if (!pendingScript) return;
    
    const scriptName = pendingScript;
    setIsPinModalOpen(false);
    
    setLoading(scriptName);
    setError(null);
    
    // Log inicial no terminal simulado
    setTerminalLogs(prev => prev + `\n$ python3 backend/scripts/${scriptName === 'backup_db' ? 'backup_db.py' : scriptName === 'analyze_security' ? 'analyze_security.py' : 'monitor_uptime.py'}\n[A INICIAR PROCESSAMENTO AUTOMÁTICO...]\n`);
    
    try {
      const res = await fetch('/backend/api/run_automation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptName, db_pin: pinInput })
      });
      const data = await res.json();
      
      if (data.success) {
        // Atualizar resultados estruturados e os logs do terminal
        setResults(prev => ({ ...prev, [scriptName]: data.output }));
        setTerminalLogs(prev => prev + (data.raw || 'Execução sem logs de texto.') + `\n[PROCESSO CONCLUÍDO COM SUCESSO]\n`);
      } else {
        const errMsg = data.message || 'Falha ao executar script.';
        setError(errMsg);
        setTerminalLogs(prev => prev + (data.raw ? `\n--- LOG DO INTERPRETADOR ---\n${data.raw}\n----------------------------\n` : '') + `\n[ERRO DE EXECUÇÃO: ${errMsg}]\n`);
      }
    } catch (err) {
      const errMsg = 'Erro de comunicação de rede com o servidor.';
      setError(errMsg);
      setTerminalLogs(prev => prev + `\n[ERRO DE REDE: ${errMsg}]\n`);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="bg-darkSurface border border-darkBorder rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Terminal className="text-brandBlue animate-pulse" size={24} />
            <h3 className="text-xl font-bold text-textPrimary">Painel de Automações & Scripts</h3>
          </div>
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-brandBlue/10 text-brandBlue text-xs font-semibold rounded-full">
            <Cpu size={12} />
            <span>Python 3 Core</span>
          </span>
        </div>
        <p className="text-textSecondary text-sm">
          Este painel permite-lhe correr scripts Python no servidor para gerir backups, monitorizar uptime e analisar tentativas de invasão. Abaixo pode executar as tarefas e inspecionar os logs de execução na consola.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-400 shadow-sm animate-shake">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-sm">Ocorreu um Erro</h5>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Grid de Ações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Backup */}
        <div className="bg-darkSurface p-5 rounded-2xl border border-darkBorder flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-md">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-inner">
                <Database size={20} />
              </div>
              <h4 className="font-semibold text-textPrimary">Cópia de Segurança</h4>
            </div>
            <p className="text-xs text-textSecondary mb-5 leading-relaxed">
              Faz o dump completo das tabelas da base de dados MySQL para um ficheiro estruturado JSON e comprime-o num arquivo ZIP seguro.
            </p>
          </div>
          <button
            onClick={() => requestAutomation('backup_db')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-darkBg border border-darkBorder rounded-xl text-xs font-semibold text-textPrimary hover:bg-emerald-500 hover:border-emerald-500 hover:text-darkBg transition-all disabled:opacity-50"
          >
            {loading === 'backup_db' ? (
              <div className="w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Play size={14} /> <span>Iniciar Backup</span></>
            )}
          </button>
        </div>

        {/* Card 2: Segurança */}
        <div className="bg-darkSurface p-5 rounded-2xl border border-darkBorder flex flex-col justify-between hover:border-rose-500/30 transition-all shadow-md">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shadow-inner">
                <ShieldAlert size={20} />
              </div>
              <h4 className="font-semibold text-textPrimary">Análise de Ataques</h4>
            </div>
            <p className="text-xs text-textSecondary mb-5 leading-relaxed">
              Lê os logs de tentativas falhadas na base de dados, bloqueia IPs maliciosos e gera estatísticas geográficas visuais no servidor.
            </p>
          </div>
          <button
            onClick={() => requestAutomation('analyze_security')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-darkBg border border-darkBorder rounded-xl text-xs font-semibold text-textPrimary hover:bg-rose-500 hover:border-rose-500 hover:text-darkBg transition-all disabled:opacity-50"
          >
            {loading === 'analyze_security' ? (
              <div className="w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Play size={14} /> <span>Analisar Logs</span></>
            )}
          </button>
        </div>

        {/* Card 3: Uptime */}
        <div className="bg-darkSurface p-5 rounded-2xl border border-darkBorder flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-md">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shadow-inner">
                <Activity size={20} />
              </div>
              <h4 className="font-semibold text-textPrimary">Teste de Uptime</h4>
            </div>
            <p className="text-xs text-textSecondary mb-5 leading-relaxed">
              Executa um ping de diagnóstico ao website. Em caso de quebra de conectividade, dispara um alerta de segurança imediato por e-mail (Brevo).
            </p>
          </div>
          <button
            onClick={() => requestAutomation('monitor_uptime')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-darkBg border border-darkBorder rounded-xl text-xs font-semibold text-textPrimary hover:bg-amber-500 hover:border-amber-500 hover:text-darkBg transition-all disabled:opacity-50"
          >
            {loading === 'monitor_uptime' ? (
              <div className="w-4 h-4 border-2 border-textPrimary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Play size={14} /> <span>Testar Ligação</span></>
            )}
          </button>
        </div>
      </div>

      {/* Terminal de Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-[11px] text-slate-500 font-semibold ml-2">python-runner@server:~</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded-md">
            Console stdout
          </div>
        </div>
        <div className="max-h-[200px] overflow-y-auto text-slate-300 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <pre className="whitespace-pre-wrap leading-relaxed select-text">{terminalLogs}</pre>
        </div>
      </div>

      {/* RESULTADOS DETALHADOS DINÂMICOS */}
      
      {/* 1. Detalhes do Backup */}
      {results['backup_db'] && (
        <div className="bg-darkSurface border border-darkBorder rounded-2xl p-6 shadow-xl animate-fadeIn">
          <h4 className="font-bold text-textPrimary text-sm flex items-center space-x-2 mb-4">
            <Database size={16} className="text-emerald-400" />
            <span>Relatório Detalhado do Backup</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-darkBg p-4 rounded-xl border border-darkBorder">
              <span className="text-[10px] text-textSecondary block uppercase font-bold">Arquivo ZIP</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-semibold text-textPrimary truncate max-w-[85%]">{results['backup_db'].file}</span>
                <button 
                  onClick={() => copyToClipboard(results['backup_db'].file)}
                  className="text-textSecondary hover:text-brandBlue transition-colors p-1"
                  title="Copiar Nome do Ficheiro"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div className="bg-darkBg p-4 rounded-xl border border-darkBorder">
              <span className="text-[10px] text-textSecondary block uppercase font-bold">Tamanho do Ficheiro</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {results['backup_db'].file_size_kb > 1024 
                  ? `${(results['backup_db'].file_size_kb / 1024).toFixed(2)} MB` 
                  : `${results['backup_db'].file_size_kb} KB`
                }
              </span>
            </div>
            <div className="bg-darkBg p-4 rounded-xl border border-darkBorder">
              <span className="text-[10px] text-textSecondary block uppercase font-bold">Tabelas Exportadas</span>
              <span className="text-base font-bold text-textPrimary mt-1 block">{results['backup_db'].tables_exported}</span>
            </div>
          </div>

          {results['backup_db'].table_stats && (
            <div>
              <span className="text-[11px] font-bold text-textSecondary uppercase block mb-2">Estatísticas por Tabela</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(results['backup_db'].table_stats).map(([table, count]: [string, any]) => (
                  <div key={table} className="bg-darkBg/50 px-3 py-2 rounded-lg border border-darkBorder/40 flex items-center justify-between">
                    <span className="text-xs text-textSecondary truncate">{table}</span>
                    <span className="text-xs font-bold text-textPrimary px-1.5 py-0.5 bg-darkSurface rounded border border-darkBorder">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Detalhes de Segurança */}
      {results['analyze_security'] && (
        <div className="bg-darkSurface border border-darkBorder rounded-2xl p-6 shadow-xl animate-fadeIn space-y-6">
          <h4 className="font-bold text-textPrimary text-sm flex items-center space-x-2 border-b border-darkBorder pb-3">
            <ShieldAlert size={16} className="text-rose-400" />
            <span>Resultados e Mapeamento de Tentativas de Invasão</span>
          </h4>

          {results['analyze_security'].total_failed === 0 ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
              Excelente! Não foram detetadas tentativas de login falhadas na base de dados.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Distribuição Geográfica */}
              <div className="bg-darkBg p-5 rounded-xl border border-darkBorder flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-textSecondary block uppercase font-bold mb-4">Distribuição Geográfica de Ataques</span>
                  <div className="space-y-4">
                    {results['analyze_security'].countries && Object.keys(results['analyze_security'].countries).length > 0 ? (
                      Object.entries(results['analyze_security'].countries).map(([country, count]: [string, any], idx) => {
                        const total = results['analyze_security'].total_failed || 1;
                        const pct = Math.round((count / total) * 100);
                        const barColors = [
                          'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-sky-500'
                        ];
                        const color = barColors[idx % barColors.length];
                        return (
                          <div key={country} className="space-y-1 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-textPrimary">{country}</span>
                              <span className="text-textSecondary font-mono">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-darkSurface h-1.5 rounded-full overflow-hidden border border-darkBorder/40">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-textSecondary space-y-2">
                        <AlertTriangle size={24} className="text-amber-500/80 animate-pulse" />
                        <p className="text-xs">Nenhum dado geográfico disponível para renderizar.</p>
                      </div>
                    )}
                  </div>
                </div>
                {results['analyze_security'].countries && (
                  <div className="text-[10px] text-textSecondary mt-4 pt-3 border-t border-darkBorder/40 flex items-center justify-between">
                    <span>Total de incidentes geolocalizados:</span>
                    <span className="font-bold text-rose-400">{results['analyze_security'].total_failed}</span>
                  </div>
                )}
              </div>

              {/* Tabelas de IP */}
              <div className="space-y-4">
                {/* Top IPs */}
                <div>
                  <span className="text-[10px] text-textSecondary block uppercase font-bold mb-2">Top IPs Bloqueados / Monitorizados</span>
                  <div className="overflow-x-auto rounded-xl border border-darkBorder bg-darkBg">
                    <table className="min-w-full divide-y divide-darkBorder text-xs">
                      <thead className="bg-darkSurface">
                        <tr>
                          <th className="px-4 py-2 text-left font-bold text-textSecondary">Endereço IP</th>
                          <th className="px-4 py-2 text-center font-bold text-textSecondary">País</th>
                          <th className="px-4 py-2 text-right font-bold text-textSecondary">Tentativas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder">
                        {results['analyze_security'].top_ips?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-darkSurface/50">
                            <td className="px-4 py-2 font-mono text-textPrimary">{item.ip}</td>
                            <td className="px-4 py-2 text-center text-textSecondary">
                              <span className="px-2 py-0.5 bg-darkSurface rounded border border-darkBorder">{item.country}</span>
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-rose-400">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tentativas Recentes */}
                <div>
                  <span className="text-[10px] text-textSecondary block uppercase font-bold mb-2">Histórico Recente de Falhas</span>
                  <div className="overflow-x-auto rounded-xl border border-darkBorder bg-darkBg">
                    <table className="min-w-full divide-y divide-darkBorder text-[11px]">
                      <thead className="bg-darkSurface">
                        <tr>
                          <th className="px-3 py-1.5 text-left font-bold text-textSecondary">Data / Hora</th>
                          <th className="px-3 py-1.5 text-left font-bold text-textSecondary">IP</th>
                          <th className="px-3 py-1.5 text-left font-bold text-textSecondary">Utilizador</th>
                          <th className="px-3 py-1.5 text-right font-bold text-textSecondary">Localização</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder">
                        {results['analyze_security'].recent_failed?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-darkSurface/50 text-textSecondary">
                            <td className="px-3 py-1.5 text-[10px] whitespace-nowrap"><Calendar size={10} className="inline mr-1" />{item.date.split(' ')[0]}</td>
                            <td className="px-3 py-1.5 font-mono text-textPrimary">{item.ip}</td>
                            <td className="px-3 py-1.5 font-semibold text-rose-300">{item.username}</td>
                            <td className="px-3 py-1.5 text-right text-[10px] whitespace-nowrap">
                              <MapPin size={9} className="inline mr-0.5 text-rose-400" />
                              {item.city}, {item.country}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Detalhes de Uptime */}
      {results['monitor_uptime'] && (
        <div className="bg-darkSurface border border-darkBorder rounded-2xl p-6 shadow-xl animate-fadeIn">
          <h4 className="font-bold text-textPrimary text-sm flex items-center space-x-2 mb-4">
            <Activity size={16} className="text-amber-400" />
            <span>Relatório de Monitorização de Conectividade</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-darkBg p-4 rounded-xl border border-darkBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary block uppercase font-bold">Estado do Servidor</span>
                <span className="text-xs text-textSecondary mt-1 block">URL: {results['monitor_uptime'].url}</span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm flex items-center space-x-1.5 ${
                results['monitor_uptime'].status === 'online' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${results['monitor_uptime'].status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span>{results['monitor_uptime'].status}</span>
              </span>
            </div>

            <div className="bg-darkBg p-4 rounded-xl border border-darkBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textSecondary block uppercase font-bold">Código HTTP</span>
                <span className="text-xs text-textSecondary mt-1 block">Tempo de resposta estável</span>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                results['monitor_uptime'].code === 200 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                HTTP {results['monitor_uptime'].code || 'ERROR'}
              </span>
            </div>
          </div>

          {results['monitor_uptime'].status !== 'online' && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-400">
              <p className="font-bold flex items-center space-x-1"><AlertTriangle size={12} /><span>Alerta de Quebra de Conectividade Acionado!</span></p>
              <p className="text-textSecondary text-[11px] mt-1">
                Brevo API Envio: {results['monitor_uptime'].email_sent ? 'Enviado com sucesso' : 'Falha ao enviar'}
              </p>
              {!results['monitor_uptime'].email_sent && (
                <p className="text-rose-400 font-mono text-[10px] mt-1">Erro: {results['monitor_uptime'].email_msg}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE SEGURANÇA: PIN DA BASE DE DADOS */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-darkBg border border-darkBorder w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative animate-fadeIn">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textPrimary uppercase tracking-tight">Autorização Necessária</h3>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                  Para executar este script é necessário introduzir o PIN exclusivo da Base de Dados.
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); executeAutomation(); }} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Introduza o PIN (Ex: 1234)"
                  className="w-full bg-darkSurface border border-darkBorder rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:border-rose-500/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-darkSurface hover:bg-zinc-800 border border-darkBorder text-textSecondary text-sm font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length < 4}
                  className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 text-textPrimary text-sm font-bold rounded-xl transition-all disabled:text-textSecondary"
                >
                  Executar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
