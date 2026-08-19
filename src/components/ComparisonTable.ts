import { ComparisonRow } from '../models/types';
import { i18n } from '../services/i18n';

export function renderComparisonTable(
  rows: ComparisonRow[],
  androidHeader = 'Android',
  iosHeader = 'iOS',
  showNote = true
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'comparison-table-wrapper';

  const hasNotes = showNote && rows.some((r) => !!r.note);

  const resolveText = (text: string) => {
    if (text.startsWith('row.cell.') || text.startsWith('row.note.') || text.startsWith('cheat.')) {
      return i18n.t(text);
    }
    return text;
  };

  const table = document.createElement('table');
  table.className = 'comparison-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="th-android">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--color-android);margin-right:6px;"></span>
        ${androidHeader}
      </th>
      <th class="th-ios">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--color-ios);margin-right:6px;"></span>
        ${iosHeader}
      </th>
      ${hasNotes ? `<th class="th-note">${i18n.t('table.note')}</th>` : ''}
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  rows.forEach((row) => {
    const tr = document.createElement('tr');

    const androidText = resolveText(row.android);
    const iosText = resolveText(row.ios);
    const noteText = row.note ? resolveText(row.note) : '';

    const tdAndroid = document.createElement('td');
    tdAndroid.className = 'cell-code cell-android';
    tdAndroid.textContent = androidText;

    const tdIos = document.createElement('td');
    tdIos.className = 'cell-code cell-ios';
    tdIos.textContent = iosText;

    tr.appendChild(tdAndroid);
    tr.appendChild(tdIos);

    if (hasNotes) {
      const tdNote = document.createElement('td');
      tdNote.className = 'cell-note';
      tdNote.textContent = noteText || i18n.t('table.dash');
      tr.appendChild(tdNote);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}
