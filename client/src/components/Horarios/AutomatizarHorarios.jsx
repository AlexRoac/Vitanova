import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import './AutomatizarHorarios.css';

const DIAS_SEMANA = [
    { key: 1, label: 'Lun', nombre: 'Lunes' },
    { key: 2, label: 'Mar', nombre: 'Martes' },
    { key: 3, label: 'Mié', nombre: 'Miércoles' },
    { key: 4, label: 'Jue', nombre: 'Jueves' },
    { key: 5, label: 'Vie', nombre: 'Viernes' },
    { key: 6, label: 'Sáb', nombre: 'Sábado' },
    { key: 0, label: 'Dom', nombre: 'Domingo' },
];

const HORAS_DISPONIBLES = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
];

const PASOS = ['Plantilla', 'Rango de fechas', 'Excepciones', 'Confirmar'];

const hoy = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

const formatFecha = (isoStr) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    const fecha = new Date(Number(y), Number(m) - 1, Number(d));
    return fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
};

const generarFechas = (desde, hasta, diasSemana, excepciones) => {
    if (!desde || !hasta || diasSemana.length === 0) return [];
    const resultado = [];
    const cur = new Date(desde + 'T00:00:00');
    const fin = new Date(hasta + 'T00:00:00');
    while (cur <= fin) {
        const dow = cur.getDay();
        const iso = cur.toISOString().split('T')[0];
        if (diasSemana.includes(dow) && !excepciones.includes(iso)) {
            resultado.push(iso);
        }
        cur.setDate(cur.getDate() + 1);
    }
    return resultado;
};

const generarHorasRango = (desde, hasta) => {
    const idxDesde = HORAS_DISPONIBLES.indexOf(desde);
    const idxHasta = HORAS_DISPONIBLES.indexOf(hasta);
    if (idxDesde < 0 || idxHasta < 0 || idxDesde > idxHasta) return [];
    return HORAS_DISPONIBLES.slice(idxDesde, idxHasta + 1);
};

const MiniCalendario = ({ desde, hasta, excepciones, onToggle, diasSemana }) => {
    const [mesActual, setMesActual] = useState(() => {
        if (desde) {
            const [y, m] = desde.split('-');
            return new Date(Number(y), Number(m) - 1, 1);
        }
        return new Date();
    });

    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const offsetInicio = primerDia.getDay();

    const celdas = [];
    for (let i = 0; i < offsetInicio; i++) celdas.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(d);

    const mesLabel = mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    const fechaEnRango = (d) => {
        const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return iso >= desde && iso <= hasta;
    };

    const esDiaActivo = (d) => {
        const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dow = new Date(iso + 'T00:00:00').getDay();
        return diasSemana.includes(dow) && fechaEnRango(d);
    };

    const esExcepcion = (d) => {
        const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return excepciones.includes(iso);
    };

    const handleClick = (d) => {
        if (!esDiaActivo(d) && !esExcepcion(d)) return;
        const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (esDiaActivo(d) || esExcepcion(d)) onToggle(iso);
    };

    const puedePrev = () => {
        const prev = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1);
        const desdeDate = new Date(desde + 'T00:00:00');
        return prev <= desdeDate || (prev.getFullYear() === desdeDate.getFullYear() && prev.getMonth() === desdeDate.getMonth());
    };

    const puedeNext = () => {
        const next = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1);
        const hastaDate = new Date(hasta + 'T00:00:00');
        return next.getFullYear() < hastaDate.getFullYear() || (next.getFullYear() === hastaDate.getFullYear() && next.getMonth() <= hastaDate.getMonth());
    };

    return (
        <div className="mini-cal">
            <div className="mini-cal-nav">
                <button className="mini-cal-btn" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))} disabled={!puedePrev()}>‹</button>
                <span className="mini-cal-mes">{mesLabel}</span>
                <button className="mini-cal-btn" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))} disabled={!puedeNext()}>›</button>
            </div>
            <div className="mini-cal-grid">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                    <div key={d} className="mini-cal-header-day">{d}</div>
                ))}
                {celdas.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const activo = esDiaActivo(d);
                    const excluido = esExcepcion(d);
                    const enRango = fechaEnRango(d);
                    return (
                        <div
                            key={d}
                            className={`mini-cal-day ${activo ? 'activo' : ''} ${excluido ? 'excluido' : ''} ${!enRango ? 'fuera-rango' : ''}`}
                            onClick={() => handleClick(d)}
                            title={activo ? 'Click para excluir este día' : excluido ? 'Click para incluir este día' : ''}
                        >
                            {d}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AutomatizarHorarios = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const psicologoId = usuario?.id;

    const [paso, setPaso] = useState(0);
    const [guardando, setGuardando] = useState(false);

    const [diasSeleccionados, setDiasSeleccionados] = useState([1, 2, 3, 4, 5]);
    const [horaInicio, setHoraInicio] = useState('09:00');
    const [horaFin, setHoraFin] = useState('17:00');
    const [horasCustomPorDia, setHorasCustomPorDia] = useState(false);
    const [horasPorDia, setHorasPorDia] = useState({});

    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const [excepciones, setExcepciones] = useState([]);

    // ✅ Helper centralizado para headers con token
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    const toggleDia = (key) => {
        setDiasSeleccionados(prev =>
            prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
        );
    };

    const toggleExcepcion = (iso) => {
        setExcepciones(prev =>
            prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso]
        );
    };

    const horasGeneradas = useMemo(() => generarHorasRango(horaInicio, horaFin), [horaInicio, horaFin]);

    const fechasFinales = useMemo(() => {
        if (!fechaDesde || !fechaHasta) return [];
        return generarFechas(fechaDesde, fechaHasta, diasSeleccionados, excepciones);
    }, [fechaDesde, fechaHasta, diasSeleccionados, excepciones]);

    const totalHoras = horasCustomPorDia
        ? fechasFinales.reduce((acc, iso) => {
            const dow = new Date(iso + 'T00:00:00').getDay();
            return acc + (horasPorDia[dow]?.length || 0);
        }, 0)
        : fechasFinales.length * horasGeneradas.length;

    const puedeAvanzar = () => {
        if (paso === 0) return diasSeleccionados.length > 0 && horasGeneradas.length > 0;
        if (paso === 1) return fechaDesde && fechaHasta && fechaHasta >= fechaDesde && fechasFinales.length > 0;
        return true;
    };

    const guardar = async () => {
        if (!psicologoId) return;
        setGuardando(true);

        const diasActivos = fechasFinales.map(iso => {
            let horas;
            if (horasCustomPorDia) {
                const dow = new Date(iso + 'T00:00:00').getDay();
                horas = horasPorDia[dow] || [];
            } else {
                horas = horasGeneradas;
            }
            return { fecha: iso, horas };
        });

        const diasExcluidos = excepciones
            .filter(iso => iso >= fechaDesde && iso <= fechaHasta)
            .map(iso => ({ fecha: iso, horas: [] }));

        const payload = [...diasActivos, ...diasExcluidos];

        try {
            let errores = 0;
            // ✅ Token obtenido una sola vez antes del loop
            const headers = getAuthHeaders();
            for (const item of payload) {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/configurar`, {
                    method: 'POST',
                    headers, // ✅ Token agregado
                    body: JSON.stringify({ psicologoId, fecha: item.fecha, horas: item.horas })
                });
                if (!res.ok) errores++;
            }

            setGuardando(false);

            if (errores === 0) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Horarios guardados!',
                    html: `<p style="color:#4a6070;font-size:0.92rem;line-height:1.7">
                        Se configuraron <strong style="color:#202343">${fechasFinales.length} días</strong>
                        con un total de <strong style="color:#202343">${totalHoras} horas</strong> disponibles.
                    </p>`,
                    confirmButtonColor: '#3a7d8c',
                    confirmButtonText: '¡Listo!',
                    timer: 5000,
                    timerProgressBar: true,
                    scrollbarPadding: false
                });
                setPaso(0);
                setDiasSeleccionados([1, 2, 3, 4, 5]);
                setHoraInicio('09:00');
                setHoraFin('17:00');
                setFechaDesde('');
                setFechaHasta('');
                setExcepciones([]);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Guardado parcial',
                    text: `${errores} día(s) no pudieron guardarse. Intenta de nuevo.`,
                    confirmButtonColor: '#3a7d8c',
                    scrollbarPadding: false
                });
            }
        } catch {
            setGuardando(false);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#3a7d8c',
                scrollbarPadding: false
            });
        }
    };

    return (
        <div className="auto-container">
            <div className="auto-header">
                <h2>Automatizar Horarios</h2>
                <p className="auto-subheader">
                    Psicólogo: <strong>{usuario.nombre} {usuario.apellido}</strong>
                </p>
                <div className="auto-divider" />
            </div>

            <div className="auto-stepper">
                {PASOS.map((nombre, i) => (
                    <React.Fragment key={i}>
                        <div className={`auto-step ${i === paso ? 'activo' : ''} ${i < paso ? 'completado' : ''}`}>
                            <div className="auto-step-circle">
                                {i < paso ? '✓' : i + 1}
                            </div>
                            <span className="auto-step-label">{nombre}</span>
                        </div>
                        {i < PASOS.length - 1 && (
                            <div className={`auto-step-line ${i < paso ? 'completada' : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="auto-body">

                {paso === 0 && (
                    <div className="auto-paso">
                        <h3 className="auto-paso-titulo">¿Qué días y horario trabajas?</h3>
                        <p className="auto-paso-desc">Selecciona los días de la semana y el rango de horas habitual.</p>

                        <div className="auto-section">
                            <label className="auto-label">Días de la semana</label>
                            <div className="dias-grid">
                                {DIAS_SEMANA.map(dia => (
                                    <button
                                        key={dia.key}
                                        className={`dia-btn ${diasSeleccionados.includes(dia.key) ? 'activo' : ''}`}
                                        onClick={() => toggleDia(dia.key)}
                                        type="button"
                                    >
                                        {dia.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="auto-section">
                            <div className="auto-label-row">
                                <label className="auto-label">Horario de atención</label>
                                <label className="auto-toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={horasCustomPorDia}
                                        onChange={e => setHorasCustomPorDia(e.target.checked)}
                                    />
                                    <span>Distinto por día</span>
                                </label>
                            </div>

                            {!horasCustomPorDia ? (
                                <div className="rango-horas">
                                    <div className="rango-group">
                                        <label className="rango-label">Desde</label>
                                        <select
                                            className="auto-select"
                                            value={horaInicio}
                                            onChange={e => setHoraInicio(e.target.value)}
                                        >
                                            {HORAS_DISPONIBLES.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="rango-flecha">→</div>
                                    <div className="rango-group">
                                        <label className="rango-label">Hasta</label>
                                        <select
                                            className="auto-select"
                                            value={horaFin}
                                            onChange={e => setHoraFin(e.target.value)}
                                        >
                                            {HORAS_DISPONIBLES.filter(h => h > horaInicio).map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {horasGeneradas.length > 0 && (
                                        <div className="rango-preview">
                                            {horasGeneradas.length} hora{horasGeneradas.length !== 1 ? 's' : ''} por día
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="horas-por-dia">
                                    {DIAS_SEMANA.filter(d => diasSeleccionados.includes(d.key)).map(dia => {
                                        const horasDia = horasPorDia[dia.key] || [];
                                        return (
                                            <div key={dia.key} className="hpd-row">
                                                <span className="hpd-nombre">{dia.nombre}</span>
                                                <div className="hpd-horas">
                                                    {HORAS_DISPONIBLES.map(h => (
                                                        <button
                                                            key={h}
                                                            type="button"
                                                            className={`hpd-hora ${horasDia.includes(h) ? 'activo' : ''}`}
                                                            onClick={() => {
                                                                const prev = horasPorDia[dia.key] || [];
                                                                setHorasPorDia({
                                                                    ...horasPorDia,
                                                                    [dia.key]: prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort()
                                                                });
                                                            }}
                                                        >
                                                            {h}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {paso === 1 && (
                    <div className="auto-paso">
                        <h3 className="auto-paso-titulo">¿A qué período aplica?</h3>
                        <p className="auto-paso-desc">Elige el rango de fechas donde se aplicará tu plantilla semanal.</p>

                        <div className="rango-fechas">
                            <div className="rf-group">
                                <label className="auto-label">Fecha de inicio</label>
                                <input
                                    type="date"
                                    className="auto-input-date"
                                    value={fechaDesde}
                                    min={hoy()}
                                    onChange={e => {
                                        setFechaDesde(e.target.value);
                                        if (fechaHasta && e.target.value > fechaHasta) setFechaHasta('');
                                    }}
                                />
                            </div>
                            <div className="rf-flecha">→</div>
                            <div className="rf-group">
                                <label className="auto-label">Fecha de fin</label>
                                <input
                                    type="date"
                                    className="auto-input-date"
                                    value={fechaHasta}
                                    min={fechaDesde || hoy()}
                                    onChange={e => setFechaHasta(e.target.value)}
                                    disabled={!fechaDesde}
                                />
                            </div>
                        </div>

                        {fechasFinales.length > 0 && (
                            <div className="rf-preview">
                                <div className="rf-stat">
                                    <span className="rf-stat-num">{fechasFinales.length}</span>
                                    <span className="rf-stat-lbl">días activos</span>
                                </div>
                                <div className="rf-stat">
                                    <span className="rf-stat-num">{totalHoras}</span>
                                    <span className="rf-stat-lbl">horas totales</span>
                                </div>
                                <div className="rf-stat">
                                    <span className="rf-stat-num">
                                        {diasSeleccionados.map(k => DIAS_SEMANA.find(d => d.key === k)?.label).join(', ')}
                                    </span>
                                    <span className="rf-stat-lbl">días por semana</span>
                                </div>
                            </div>
                        )}

                        {fechaDesde && fechaHasta && fechasFinales.length === 0 && (
                            <div className="rf-warning">
                                ⚠️ No hay días activos en ese rango con tu plantilla actual.
                            </div>
                        )}
                    </div>
                )}

                {paso === 2 && (
                    <div className="auto-paso">
                        <h3 className="auto-paso-titulo">¿Hay días que excluir?</h3>
                        <p className="auto-paso-desc">
                            Toca los días resaltados para marcarlos como no disponibles (vacaciones, festivos, etc.).
                            Los días en verde serán configurados; los en rojo quedan excluidos.
                        </p>

                        <MiniCalendario
                            desde={fechaDesde}
                            hasta={fechaHasta}
                            excepciones={excepciones}
                            onToggle={toggleExcepcion}
                            diasSemana={diasSeleccionados}
                        />

                        {excepciones.length > 0 && (
                            <div className="excepciones-lista">
                                <span className="auto-label">Días excluidos ({excepciones.length})</span>
                                <div className="exc-chips">
                                    {excepciones.sort().map(iso => (
                                        <span key={iso} className="exc-chip" onClick={() => toggleExcepcion(iso)}>
                                            {formatFecha(iso)} ✕
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {excepciones.length === 0 && (
                            <p className="auto-hint">No has excluido ningún día. Puedes continuar o marcar fechas arriba.</p>
                        )}
                    </div>
                )}

                {paso === 3 && (
                    <div className="auto-paso">
                        <h3 className="auto-paso-titulo">Resumen de tu configuración</h3>
                        <p className="auto-paso-desc">Revisa los detalles antes de guardar. Esta acción sobrescribirá los horarios existentes en las fechas indicadas.</p>

                        <div className="resumen-grid">
                            <div className="resumen-card">
                                <span className="resumen-icon">📅</span>
                                <span className="resumen-val">{fechasFinales.length}</span>
                                <span className="resumen-lbl">Días</span>
                            </div>
                            <div className="resumen-card">
                                <span className="resumen-icon">⏰</span>
                                <span className="resumen-val">{totalHoras}</span>
                                <span className="resumen-lbl">Horas</span>
                            </div>
                            <div className="resumen-card">
                                <span className="resumen-icon">🚫</span>
                                <span className="resumen-val">{excepciones.length}</span>
                                <span className="resumen-lbl">Excluidos</span>
                            </div>
                        </div>

                        <div className="resumen-detalle">
                            <div className="rd-row">
                                <span className="rd-key">Período</span>
                                <span className="rd-val">{formatFecha(fechaDesde)} — {formatFecha(fechaHasta)}</span>
                            </div>
                            <div className="rd-row">
                                <span className="rd-key">Días activos</span>
                                <span className="rd-val">
                                    {diasSeleccionados.map(k => DIAS_SEMANA.find(d => d.key === k)?.nombre).join(', ')}
                                </span>
                            </div>
                            {!horasCustomPorDia && (
                                <div className="rd-row">
                                    <span className="rd-key">Horario</span>
                                    <span className="rd-val">{horaInicio} – {horaFin} ({horasGeneradas.length} horas/día)</span>
                                </div>
                            )}
                        </div>

                        <div className="resumen-aviso">
                            ⚠️ Los horarios ya ocupados por citas agendadas no serán modificados.
                        </div>
                    </div>
                )}
            </div>

            <div className="auto-nav">
                {paso > 0 && (
                    <button className="auto-btn-sec" onClick={() => setPaso(p => p - 1)} disabled={guardando}>
                        ← Atrás
                    </button>
                )}
                <div style={{ flex: 1 }} />
                {paso < PASOS.length - 1 ? (
                    <button
                        className="auto-btn-pri"
                        onClick={() => setPaso(p => p + 1)}
                        disabled={!puedeAvanzar()}
                    >
                        Siguiente →
                    </button>
                ) : (
                    <button
                        className="auto-btn-guardar"
                        onClick={guardar}
                        disabled={guardando || fechasFinales.length === 0}
                    >
                        {guardando ? (
                            <><span className="auto-spinner" /> Guardando...</>
                        ) : (
                            '✓ Guardar todos los horarios'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AutomatizarHorarios;
