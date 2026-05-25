let currentStep = 1;
let tipoGenitore = 'entrambi'; // 'entrambi' | 'unico'
let consenso = null;           // 'si' | 'no'
let fratelliValue = 'no';      // 'si' | 'no'

// ---- Inizializzazione ----
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dataPresent').value = new Date().toISOString().split('T')[0];
    updateProgress();
});

// ---- Navigazione steps ----
function goToStep(n) {
    if (n > currentStep && !validateStep(currentStep)) return;
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = n;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress();
    if (n === 3) buildSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Barra progresso ----
function updateProgress() {
    const lineWidths = ['0%', '33%', '66%', '100%'];
    [1, 2, 3, 4].forEach(i => {
        const dot = document.getElementById(`dot${i}`);
        dot.classList.remove('active', 'completed');
        if (i < currentStep) dot.classList.add('completed');
        else if (i === currentStep) dot.classList.add('active');
    });
    document.getElementById('progressLine').style.width = lineWidths[currentStep - 1];
}

// ---- Validazione ----
function showError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.classList.add('field-error');
    let err = el.parentElement.querySelector('.inline-error');
    if (!err) {
        err = document.createElement('div');
        err.className = 'inline-error';
        el.parentElement.appendChild(err);
    }
    err.textContent = msg;
}

function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    document.querySelectorAll('.inline-error').forEach(el => el.remove());
    const ce = document.getElementById('consensoError');
    if (ce) ce.style.display = 'none';
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCF(cf) {
    return /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(cf.toUpperCase());
}

function validateGenitore(prefix) {
    let ok = true;
    const campi = [
        ['Nome', `${prefix}Nome`],
        ['Cognome', `${prefix}Cognome`],
        ['Luogo di nascita', `${prefix}LuogoNascita`],
        ['Data di nascita', `${prefix}DataNascita`],
        ['Via', `${prefix}Via`],
        ['N° civico', `${prefix}Numero`],
        ['Città', `${prefix}Citta`],
        ['Provincia', `${prefix}Provincia`],
        ['CAP', `${prefix}CAP`],
        ['Telefono', `${prefix}Tel`],
    ];
    campi.forEach(([label, id]) => {
        if (!v(id)) { showError(id, `${label} obbligatorio`); ok = false; }
    });
    const cf = v(`${prefix}CF`);
    if (!cf) {
        showError(`${prefix}CF`, 'Codice fiscale obbligatorio'); ok = false;
    } else if (!validateCF(cf)) {
        showError(`${prefix}CF`, 'Formato codice fiscale non valido'); ok = false;
    }
    const email = v(`${prefix}Email`);
    if (!email) {
        showError(`${prefix}Email`, 'Email obbligatoria'); ok = false;
    } else if (!validateEmail(email)) {
        showError(`${prefix}Email`, 'Indirizzo email non valido'); ok = false;
    }
    return ok;
}

function validateStep(step) {
    clearErrors();
    if (step === 1) {
        let ok = validateGenitore('g1');
        if (tipoGenitore === 'entrambi') ok = validateGenitore('g2') && ok;
        return ok;
    }
    if (step === 2) {
        let ok = true;
        const campi = [
            ['Nome', 'bNome'], ['Cognome', 'bCognome'],
            ['Luogo di nascita', 'bLuogoNascita'], ['Data di nascita', 'bDataNascita'],
            ['Città', 'bCitta'], ['Via / Piazza', 'bVia'],
        ];
        campi.forEach(([label, id]) => {
            if (!v(id)) { showError(id, `${label} obbligatorio`); ok = false; }
        });
        const cf = v('bCF');
        if (!cf) {
            showError('bCF', 'Codice fiscale obbligatorio'); ok = false;
        } else if (!validateCF(cf)) {
            showError('bCF', 'Formato codice fiscale non valido'); ok = false;
        }
        return ok;
    }
    if (step === 3) {
        let ok = true;
        if (!consenso) {
            document.getElementById('consensoError').style.display = 'block';
            ok = false;
        }
        if (!v('luogoPresent')) { showError('luogoPresent', 'Luogo obbligatorio'); ok = false; }
        return ok;
    }
    return true;
}

// ---- Selezione tipo genitore ----
function selectTipo(tipo) {
    tipoGenitore = tipo;
    const entrambi = tipo === 'entrambi';
    document.getElementById('opt-entrambi').classList.toggle('selected', entrambi);
    document.getElementById('opt-unico').classList.toggle('selected', !entrambi);
    document.getElementById('genitore2Card').style.display = entrambi ? 'block' : 'none';
    document.getElementById('genitore1Label').textContent = entrambi ? 'Genitore 1' : 'Unico genitore / tutore';
}

// ---- Fratelli toggle ----
function selectFratelli(val) {
    fratelliValue = val;
    document.getElementById('fratelliSi').classList.toggle('selected', val === 'si');
    document.getElementById('fratelliNo').classList.toggle('selected', val === 'no');
    document.getElementById('fratelliNomeGroup').style.display = val === 'si' ? 'block' : 'none';
}

// ---- Selezione consenso privacy ----
function selectConsent(val) {
    consenso = val;
    document.getElementById('consensoSi').classList.toggle('selected', val === 'si');
    document.getElementById('consensoNo').classList.toggle('selected', val === 'no');
    document.getElementById('consensoError').style.display = 'none';
}

// ---- Riepilogo step 3 ----
function buildSummary() {
    const g2 = tipoGenitore === 'entrambi' ? `${v('g2Nome')} ${v('g2Cognome')}` : '—';
    document.getElementById('summaryContent').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div><b>Ragazzo/a:</b></div><div>${v('bNome')} ${v('bCognome')}</div>
            <div><b>Data nascita:</b></div><div>${formatDate(v('bDataNascita'))}</div>
            <div><b>Genitore 1:</b></div><div>${v('g1Nome')} ${v('g1Cognome')}</div>
            <div><b>Genitore 2:</b></div><div>${g2}</div>
            <div><b>Email:</b></div><div>${v('g1Email')}</div>
            <div><b>Telefono:</b></div><div>${v('g1Tel')}</div>
        </div>`;
}

// ---- Helpers ----
function v(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function generateId() {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TR2-${new Date().getFullYear()}-${rand}`;
}

// ---- Invio form ----
async function submitForm() {
    if (!validateStep(3)) return;

    const btnSubmit = document.getElementById('submitBtn');
    btnSubmit.disabled = true;
    document.getElementById('loadingOverlay').classList.add('visible');

    const registrationId = generateId();

    const data = {
        registrationId,
        tipo_genitore: tipoGenitore,
        genitore1: {
            nome:           v('g1Nome'),
            cognome:        v('g1Cognome'),
            luogo_nascita:  v('g1LuogoNascita'),
            data_nascita:   v('g1DataNascita'),
            codice_fiscale: v('g1CF').toUpperCase(),
            via:            v('g1Via'),
            numero:         v('g1Numero'),
            citta:          v('g1Citta'),
            provincia:      v('g1Provincia').toUpperCase(),
            cap:            v('g1CAP'),
            email:          v('g1Email').toLowerCase(),
            telefono:       v('g1Tel')
        },
        genitore2: tipoGenitore === 'entrambi' ? {
            nome:           v('g2Nome'),
            cognome:        v('g2Cognome'),
            luogo_nascita:  v('g2LuogoNascita'),
            data_nascita:   v('g2DataNascita'),
            codice_fiscale: v('g2CF').toUpperCase(),
            via:            v('g2Via'),
            numero:         v('g2Numero'),
            citta:          v('g2Citta'),
            provincia:      v('g2Provincia').toUpperCase(),
            cap:            v('g2CAP'),
            email:          v('g2Email').toLowerCase(),
            telefono:       v('g2Tel')
        } : null,
        bambino: {
            nome:           v('bNome'),
            cognome:        v('bCognome'),
            luogo_nascita:  v('bLuogoNascita'),
            data_nascita:   v('bDataNascita'),
            codice_fiscale: v('bCF').toUpperCase(),
            residente_a:    v('bCitta'),
            via:            v('bVia')
        },
        fratelli_agesci: {
            presente: fratelliValue === 'si',
            nome: fratelliValue === 'si' ? v('fratelliNome') : ''
        },
        parrocchia:  v('parrocchia'),
        motivazione: v('motivazione'),
        hobby:       v('hobby'),
        altre_info:  v('altreInfo'),
        privacy: {
            consenso:           consenso === 'si',
            data_presentazione: v('dataPresent'),
            luogo:              v('luogoPresent')
        },
        stato:      'in_attesa',
        note_admin: '',
        imported:   false,
        created_at: firebase.firestore.Timestamp.now()
    };

    try {
        await db.collection('lista_attesa').doc(registrationId).set(data);

        document.getElementById('loadingOverlay').classList.remove('visible');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep = 4;
        document.getElementById('step4').classList.add('active');
        updateProgress();
        document.getElementById('successScreen').style.display = 'block';
        document.getElementById('successName').textContent = `${data.bambino.nome} ${data.bambino.cognome}`;
        document.getElementById('successId').textContent = registrationId;
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        document.getElementById('loadingOverlay').classList.remove('visible');
        btnSubmit.disabled = false;
        alert(`Errore durante l'invio: ${err.message}\n\nVerifica la connessione e riprova.`);
        console.error(err);
    }
}
