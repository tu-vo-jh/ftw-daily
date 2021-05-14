import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { PropertyGroup } from '../../components';

import css from './TeacherListingPage.module.css';

const SectionSubjects = props => {
    const { options, publicData } = props;
    if (!publicData) {
        return null;
    }

    const selectedOptions = publicData && publicData.subjects ? publicData.subjects : [];
    return (
        <div className={css.sectionFeatures}>
            <h2 className={css.featuresTitle}>
                <FormattedMessage id="TeacherListingPage.subjectTitle" />
            </h2>
            <PropertyGroup
                id="TeacherListingPage.subject"
                options={options}
                selectedOptions={selectedOptions}
                twoColumns={true}
            />
        </div>
    );
};

export default SectionSubjects;
