import React from 'react';
import propTypes from 'prop-types';
import { renderColumnComponent } from '../../Utilities/helpers';
import { JOB_FAILED_MESSAGE, JOB_TIMED_OUT_MESSAGE } from '../../constants';
import SplitMessages from '../../PresentationalComponents/SplitMessages/SplitMessages';

const SystemNameCell = ({ system, display_name }, index) => (
  <a
    key={`system-title-${index}`}
    href={
      insights.chrome.isBeta()
        ? `/beta/insights/inventory/${system}`
        : `/insights/inventory/${system}`
    }
  >
    {display_name}
  </a>
);

SystemNameCell.propTypes = {
  system: propTypes.string,
  display_name: propTypes.node,
};

export const SystemColumn = {
  title: 'System name',
  props: {
    width: 30,
  },
  sortByProp: 'display_name',
  renderExport: (job) => job.display_name,
  renderFunc: renderColumnComponent(SystemNameCell),
};

export const StatusColumn = {
  title: 'Status',
  props: {
    width: 10,
  },
  sortByProp: 'status',
  renderExport: (job) => job.status,
};

export const MessageColumn = {
  title: 'Message',
  props: {
    width: 35,
  },
  sortByProp: 'results.message',
  renderExport: (job) => job.message,
  renderFunc: (_, _empty, job) => {
    if (job.results.message && job.results.alert) {
      return <SplitMessages content={job.results.message} />;
    } else if (job.status === 'Failure') {
      return <SplitMessages content={JOB_FAILED_MESSAGE} />;
    } else if (job.status === 'Timeout') {
      return <SplitMessages content={JOB_TIMED_OUT_MESSAGE} />;
    } else if (job.status === 'Running') {
      return <span style={{ color: '#72767B' }}>No result yet</span>;
    }
  },
};

export const exportableColumns = [SystemColumn, StatusColumn, MessageColumn];

export default [SystemColumn, StatusColumn, MessageColumn];
