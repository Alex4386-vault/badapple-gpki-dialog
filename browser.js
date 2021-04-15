const HOST = 'http://localhost:8080';

function applyTheseCerts(certs) {
  const certTable = document.getElementById('xwup_cert_table').getElementsByTagName('tbody')[0];
  let certRows = [];

  for (const thisCert of certs) {
    const thisCertSubject = thisCert.subject ? thisCert.subject.map((n) => n.name + '=' + n.value).join(',') : '';
    const thisCertIssuer = thisCert.issuer ? thisCert.issuer.map((n) => n.name + '=' + n.value).join(',') : '';
    const commonNames = thisCert.subject.filter((n) => n.name === 'cn');
    const commonName = commonNames.length > 0 ? commonNames[0].value : 'undefined';

    const rowString = `
      <tr role="row" aria-selected="true" subject="${thisCertSubject}" issuer="${thisCertIssuer}" serial="${
      thisCert.serial
    }" tabindex="0" class="xwup-tableview${thisCert.selected ? '-selected' : ''}-row" style="">
        <td style="">
          <div class="xwup-tableview-cell" title="${thisCert.selected ? '선택 ' : ''}${
      thisCert.status ? thisCert.status + ' ' : '정상 '
    }인증서" style="display: none; width: 0px; height: 0px;">
            ${thisCert.selected ? '선택 ' : ''}${thisCert.status ? thisCert.status + ' ' : '정상 '} 인증서
          </div>
          <div class="xwup-tableview-cell" title="${thisCert.type ? '은행개인 ' : ''}" style="">
            <img src="https://www.gov.kr/webPlugins/AnySign4PC_LITE/AnySign4PC/img/cert${
              thisCert.img ? thisCert.img : '0'
            }.png" alt="정상 인증서" style="">
            은행개인
          </div>
        </td>
        <td style="font-family: monospace !important;">
          <div class="xwup-tableview-cell" title="${commonName}" style="display: block; font-family: monospace !important;">
            ${commonName.replace(' ', '&nbsp;')}
          </div>
        </td>
        <td style="">
          <div class="xwup-tableview-cell" title="${thisCert.expiresAt}" style="display: block; text-align: center;">
            ${thisCert.expiresAt}
          </div>
        </td>
        <td style="">
          <div class="xwup-tableview-cell" title="${thisCert.issuedBy}" style="display: block; text-align: center;">
            ${thisCert.issuedBy}
          </div>
        </td>
      </tr>`;

    certRows.push(rowString);
  }

  certTable.innerHTML = certRows.join('\n');
}

function wait(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms);
  });
}

async function loadFrame(frame) {
  const imageFile = frame.toString().padStart(5, '0') + '.png';
  console.log('Loaded Frame');
  const result = await fetch(HOST + '/gpki/' + imageFile);

  const json = await result.json();
  applyTheseCerts(json);
}

async function start() {
  for (let i = 1; i < 5259; i++) {
    try {
      await loadFrame(i);
      await wait(1000 / 24);
    } catch (e) {}
  }
}
