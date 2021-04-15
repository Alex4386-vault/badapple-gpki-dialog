export interface GPKICertInterface {
  selected: boolean;
  type?: GPKICertType;
  status?: GPKICertStatus;
  img?: number | string;
  subject: NameValueMap<GPKISubjectMapName, string>[];
  issuer: NameValueMap<GPKISubjectMapName, string>[];
  serial: string;
  expiresAt: string;
  issuedBy: string;
}

type GPKICertType = '은행개인' | '은행법인' | '범용개인' | '범용법인';
type GPKICertStatus = '정상' | '만료';
type GPKISubjectMapName = 'cn' | 'ou' | 'o' | 'c';

interface NameValueMap<T, U> {
  name: T;
  value: U;
}
