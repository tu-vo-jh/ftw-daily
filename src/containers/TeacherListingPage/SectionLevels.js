import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { PropertyGroup } from '../../components';

import css from './TeacherListingPage.module.css';

const SectionLevels = props => {
    const { options, publicData } = props;
    if (!publicData) {
        return null;
    }

    const selectedOptions = publicData && publicData.levels ? publicData.levels : [];
    return (
        <div className={css.sectionFeatures}>
            <h2 className={css.featuresTitle}>
                <FormattedMessage id="TeacherListingPage.levelTitle" />
            </h2>
            <PropertyGroup
                id="TeacherListingPage.level"
                options={options}
                selectedOptions={selectedOptions}
                twoColumns={true}
            />
        </div>
    );
};

export default SectionLevels;
