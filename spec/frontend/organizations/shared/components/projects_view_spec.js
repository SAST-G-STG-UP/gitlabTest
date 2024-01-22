import VueApollo from 'vue-apollo';
import Vue from 'vue';
import { GlLoadingIcon, GlEmptyState, GlKeysetPagination } from '@gitlab/ui';
import ProjectsView from '~/organizations/shared/components/projects_view.vue';
import projectsQuery from '~/organizations/shared/graphql/queries/projects.query.graphql';
import { formatProjects } from '~/organizations/shared/utils';
import ProjectsList from '~/vue_shared/components/projects_list/projects_list.vue';
import { createAlert } from '~/alert';
import { DEFAULT_PER_PAGE } from '~/api';
import { shallowMountExtended } from 'helpers/vue_test_utils_helper';
import createMockApollo from 'helpers/mock_apollo_helper';
import waitForPromises from 'helpers/wait_for_promises';
import {
  organizationProjects as nodes,
  pageInfo,
  pageInfoEmpty,
  pageInfoOnePage,
} from '~/organizations/mock_data';

jest.mock('~/alert');

Vue.use(VueApollo);

describe('ProjectsView', () => {
  let wrapper;
  let mockApollo;

  const defaultProvide = {
    projectsEmptyStateSvgPath: 'illustrations/empty-state/empty-projects-md.svg',
    newProjectPath: '/projects/new',
    organizationGid: 'gid://gitlab/Organizations::Organization/1',
  };

  const defaultPropsData = {
    listItemClass: 'gl-px-5',
  };

  const projects = {
    nodes,
    pageInfo,
  };

  const successHandler = jest.fn().mockResolvedValue({
    data: {
      organization: {
        id: defaultProvide.organizationGid,
        projects,
      },
    },
  });

  const createComponent = ({ handler = successHandler, propsData = {} } = {}) => {
    mockApollo = createMockApollo([[projectsQuery, handler]]);

    wrapper = shallowMountExtended(ProjectsView, {
      apolloProvider: mockApollo,
      provide: defaultProvide,
      propsData: {
        ...defaultPropsData,
        ...propsData,
      },
    });
  };

  const findPagination = () => wrapper.findComponent(GlKeysetPagination);
  const findLoadingIcon = () => wrapper.findComponent(GlLoadingIcon);
  const findEmptyState = () => wrapper.findComponent(GlEmptyState);
  const findProjectsList = () => wrapper.findComponent(ProjectsList);

  afterEach(() => {
    mockApollo = null;
  });

  describe('when API call is loading', () => {
    it('renders loading icon', () => {
      createComponent();

      expect(findLoadingIcon().exists()).toBe(true);
    });
  });

  describe('when API call is successful', () => {
    describe('when there are no projects', () => {
      const emptyHandler = jest.fn().mockResolvedValue({
        data: {
          organization: {
            id: defaultProvide.organizationGid,
            projects: {
              nodes: [],
              pageInfo: pageInfoEmpty,
            },
          },
        },
      });

      it('renders empty state without buttons by default', async () => {
        createComponent({ handler: emptyHandler });

        await waitForPromises();

        expect(findEmptyState().props()).toMatchObject({
          title: "You don't have any projects yet.",
          description:
            'Projects are where you can store your code, access issues, wiki, and other features of GitLab.',
          svgHeight: 144,
          svgPath: defaultProvide.projectsEmptyStateSvgPath,
          primaryButtonLink: null,
          primaryButtonText: null,
        });
      });

      describe('when `shouldShowEmptyStateButtons` is `true` and `projectsEmptyStateSvgPath` is set', () => {
        it('renders empty state with buttons', async () => {
          createComponent({
            handler: emptyHandler,
            propsData: { shouldShowEmptyStateButtons: true },
          });

          await waitForPromises();

          expect(findEmptyState().props()).toMatchObject({
            primaryButtonLink: defaultProvide.newProjectPath,
            primaryButtonText: 'New project',
          });
        });
      });
    });

    describe('when there are projects', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders `ProjectsList` component and passes correct props', async () => {
        await waitForPromises();

        expect(findProjectsList().props()).toMatchObject({
          projects: formatProjects(nodes),
          showProjectIcon: true,
          listItemClass: defaultPropsData.listItemClass,
        });
      });
    });

    describe('when there is one page of projects', () => {
      beforeEach(async () => {
        createComponent({
          handler: jest.fn().mockResolvedValue({
            data: {
              organization: {
                id: defaultProvide.organizationGid,
                projects: {
                  nodes,
                  pageInfo: pageInfoOnePage,
                },
              },
            },
          }),
        });
        await waitForPromises();
      });

      it('does not render pagination', () => {
        expect(findPagination().exists()).toBe(false);
      });
    });

    describe('when there is a next page of projects', () => {
      const mockEndCursor = 'mockEndCursor';
      const handler = jest.fn().mockResolvedValue({
        data: {
          organization: {
            id: defaultProvide.organizationGid,
            projects: {
              nodes,
              pageInfo: {
                ...pageInfo,
                hasNextPage: true,
                hasPreviousPage: false,
              },
            },
          },
        },
      });

      beforeEach(async () => {
        createComponent({ handler });
        await waitForPromises();
      });

      it('renders pagination', () => {
        expect(findPagination().exists()).toBe(true);
      });

      describe('when next button is clicked', () => {
        beforeEach(async () => {
          findPagination().vm.$emit('next', mockEndCursor);
          await waitForPromises();
        });

        it('calls query with correct variables', () => {
          expect(handler).toHaveBeenCalledWith({
            after: mockEndCursor,
            before: null,
            first: DEFAULT_PER_PAGE,
            id: defaultProvide.organizationGid,
            last: null,
          });
        });

        it('emits `page-change` event', () => {
          expect(wrapper.emitted('page-change')[1]).toEqual([
            {
              endCursor: mockEndCursor,
              startCursor: null,
              hasPreviousPage: false,
            },
          ]);
        });
      });
    });

    describe('when there is a previous page of projects', () => {
      const mockStartCursor = 'mockStartCursor';
      const handler = jest.fn().mockResolvedValue({
        data: {
          organization: {
            id: defaultProvide.organizationGid,
            projects: {
              nodes,
              pageInfo: {
                ...pageInfo,
                hasNextPage: false,
                hasPreviousPage: true,
              },
            },
          },
        },
      });

      beforeEach(async () => {
        createComponent({ handler });
        await waitForPromises();
      });

      it('renders pagination', () => {
        expect(findPagination().exists()).toBe(true);
      });

      describe('when next button is clicked', () => {
        beforeEach(async () => {
          findPagination().vm.$emit('prev', mockStartCursor);
          await waitForPromises();
        });

        it('calls query with correct variables', () => {
          expect(handler).toHaveBeenCalledWith({
            after: null,
            before: mockStartCursor,
            first: null,
            id: defaultProvide.organizationGid,
            last: DEFAULT_PER_PAGE,
          });
        });

        it('emits `page-change` event', () => {
          expect(wrapper.emitted('page-change')[1]).toEqual([
            {
              endCursor: null,
              startCursor: mockStartCursor,
              hasPreviousPage: true,
            },
          ]);
        });
      });
    });
  });

  describe('when API call is not successful', () => {
    const error = new Error();

    beforeEach(() => {
      createComponent({ handler: jest.fn().mockRejectedValue(error) });
    });

    it('displays error alert', async () => {
      await waitForPromises();

      expect(createAlert).toHaveBeenCalledWith({
        message: ProjectsView.i18n.errorMessage,
        error,
        captureError: true,
      });
    });
  });
});
