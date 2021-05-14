import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';

import css from './TeacherListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION = 20;

const SectionTeachingType = props => {
    const { options, publicData } = props;
    const type = options.find(item => item.key === publicData.types);

    const description = type ? type.label + ' - ' + publicData.numberOfHours : options[0].label;
    return description ? (
        <div className={css.sectionDescription}>
            <h2 className={css.descriptionTitle}>
                <FormattedMessage id="TeacherListingPage.teachingTypeTitle" />
            </h2>
            <p className={css.description}>
                {richText(description, {
                    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION,
                    longWordClass: css.longWord,
                })}
            </p>
        </div>
    ) : null;
};

export default SectionTeachingType;