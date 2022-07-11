import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TasksTables from '../../Utilities/hooks/useTableTools/Components/TasksTables';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import columns, { exportableColumns } from './Columns';
import { fetchExecutedTask, fetchExecutedTaskJobs } from '../../../api';
import * as Filters from './Filters';
import {
  COMPLETED_INFO_PANEL,
  COMPLETED_INFO_PANEL_FLEX_PROPS,
  COMPLETED_INFO_BUTTONS,
  COMPLETED_INFO_BUTTONS_FLEX_PROPS,
  LOADING_INFO_PANEL,
  LOADING_JOBS_TABLE,
  TASK_ERROR,
  TASKS_TABLE_DEFAULTS,
} from '../../constants';
import FlexibleFlex from '../../PresentationalComponents/FlexibleFlex/FlexibleFlex';
import EmptyStateDisplay from '../../PresentationalComponents/EmptyStateDisplay/EmptyStateDisplay';
import { emptyRows } from '../../PresentationalComponents/NoResultsTable/NoResultsTable';
import { dispatchNotification } from '../../Utilities/Dispatcher';

const CompletedTaskDetails = () => {
  const { id } = useParams();
  const filters = Object.values(Filters);
  const [completedTaskDetails, setCompletedTaskDetails] =
    useState(LOADING_INFO_PANEL);
  const [completedTaskJobs, setCompletedTaskJobs] =
    useState(LOADING_JOBS_TABLE);
  const [error, setError] = useState();

  const isError = (result) => {
    return result?.response?.status && result?.response?.status !== 200;
  };

  const setErrors = (result) => {
    setError(result);
    dispatchNotification({
      variant: 'danger',
      title: 'Error',
      description: result.message,
      dismissable: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      let taskDetails = await fetchExecutedTask(id);

      if (isError(taskDetails)) {
        setErrors(taskDetails);
      } else {
        const taskJobs = await fetchExecutedTaskJobs(id);

        if (isError(taskJobs)) {
          setErrors(taskJobs);
        } else {
          taskDetails.messages_count = taskJobs.filter((item) => {
            return item.message !== 'No vulnerability found.';
          }).length;
          taskDetails.system_count = taskJobs.length;
          await setCompletedTaskDetails(taskDetails);
          await setCompletedTaskJobs(taskJobs);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {error ? (
        <EmptyStateDisplay
          icon={ExclamationCircleIcon}
          color="#c9190b"
          title={'Task cannot be displayed'}
          text={TASK_ERROR}
          error={`Error ${error?.response?.status}: ${error?.message}`}
        />
      ) : (
        <React.Fragment>
          <PageHeader>
            <Breadcrumb ouiaId="completed-tasks-details-breadcrumb">
              <BreadcrumbItem to="/beta/insights/tasks/executed">
                Tasks
              </BreadcrumbItem>
              <BreadcrumbItem isActive>
                {completedTaskDetails.task_title}
              </BreadcrumbItem>
            </Breadcrumb>
            <Flex direction={{ default: 'column', md: 'row' }}>
              <Flex
                direction={{ default: 'column' }}
                flex={{ default: 'flex_1' }}
              >
                <FlexItem>
                  <PageHeaderTitle title={completedTaskDetails.task_title} />
                </FlexItem>
                <FlexItem>{completedTaskDetails.description}</FlexItem>
              </Flex>
              <FlexibleFlex
                data={completedTaskDetails}
                flexContents={COMPLETED_INFO_BUTTONS}
                flexProps={COMPLETED_INFO_BUTTONS_FLEX_PROPS}
              />
            </Flex>
          </PageHeader>
          <Main>
            <Card>
              <Flex
                className="completed-task-details-info-border"
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                direction={{ default: 'column', md: 'row' }}
              >
                <FlexibleFlex
                  data={completedTaskDetails}
                  flexContents={COMPLETED_INFO_PANEL}
                  flexProps={COMPLETED_INFO_PANEL_FLEX_PROPS}
                />
              </Flex>
            </Card>
            <br />
            <Card>
              <TasksTables
                label={`${completedTaskDetails.id}-completed-jobs`}
                ouiaId={`${completedTaskDetails.id}-completed-jobs-table`}
                columns={columns}
                items={completedTaskJobs}
                filters={{
                  filterConfig: filters,
                }}
                options={{
                  ...TASKS_TABLE_DEFAULTS,
                  exportable: {
                    ...TASKS_TABLE_DEFAULTS.exportable,
                    columns: exportableColumns,
                  },
                }}
                emptyRows={emptyRows('jobs')}
                isStickyHeader
              />
            </Card>
          </Main>
        </React.Fragment>
      )}
    </div>
  );
};

export default CompletedTaskDetails;