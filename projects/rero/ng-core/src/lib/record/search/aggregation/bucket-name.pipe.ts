import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateLanguageService } from '../../../translate/translate-language.service';

@Pipe({
  name: 'bucketName'
})
export class BucketNamePipe implements PipeTransform {

  /**
   * Constructor.
   *
   * @param _translateLanguage - TranslateLanguage service.
   * @param _translateService - Translate service.
   */
  constructor(
    private _translateLanguage: TranslateLanguageService,
    private _translateService: TranslateService
    ) {}

  /**
   * Get bucket name.
   *
   * @param bucket - bucket Object.
   * @param aggregationKey - key of aggregation.
   * @return the translated name of filter
   */
  transform(bucket: any, aggregationKey: string): string {
    // If a name is provided, we take directly that value.
    if (bucket.name) {
      return bucket.name;
    }

    // For language aggregation, we transform language code to human readable
    // language.
    if (aggregationKey === 'language') {
      return this._translateLanguage.translate(bucket.key, this._translateService.currentLang);
    }

    // Simply translate the bucket key.
    return this._translateService.instant(bucket.key);
  }

}
