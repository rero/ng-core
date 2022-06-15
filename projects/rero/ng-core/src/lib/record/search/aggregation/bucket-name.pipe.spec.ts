import { BucketNamePipe } from './bucket-name.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLanguageService } from '../../../translate/translate-language.service';
import { TestBed } from '@angular/core/testing';

describe('BucketNamePipe', () => {
  let bucketNamePipe: BucketNamePipe;
  let translateLanguageService: TranslateLanguageService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        BucketNamePipe,
        TranslateLanguageService,
        TranslateService
      ]
    });
    bucketNamePipe = TestBed.inject(BucketNamePipe);
    translateLanguageService = TestBed.inject(TranslateLanguageService);
    translateService = TestBed.inject(TranslateService);

    translateService.setTranslation('fr', {
      docsubtype_music: 'musique',
      docmaintype_book: 'livre, texte'
    });
    translateService.use('fr');
  });

  it('create an instance', () => {
    expect(bucketNamePipe).toBeTruthy();
  });

  it('should return musique', () => {
    const bucket = { key: 'docsubtype_music', aggregationKey: 'document_subtype' };
    expect(bucketNamePipe.transform(bucket, 'document_subtype')).toEqual('musique');
  });

  it('should return livre, texte', () => {
    const bucket = { key: 'docmaintype_book', aggregationKey: 'document_type' };
    expect(bucketNamePipe.transform(bucket, 'document_type')).toEqual('livre, texte');
  });

  it('should return allemand', () => {
    const bucket = { key: 'ger', aggregationKey: 'language' };
    expect(bucketNamePipe.transform(bucket, 'language')).toEqual('allemand');
  });

  it('should return Network of fictive libraries', () => {
    const bucket = { key: '3', aggregationKey: 'organisation', name: 'Network of fictive libraries' };
    expect(bucketNamePipe.transform(bucket, 'organisation')).toEqual('Network of fictive libraries');
  });
});
