import { mount } from '@vue/test-utils';
import { GlCollapsibleListbox, GlListboxItem, GlButton } from '@gitlab/ui';
import Vue, { nextTick } from 'vue';
// eslint-disable-next-line no-restricted-imports
import Vuex from 'vuex';
import { mockTracking } from 'helpers/tracking_helper';
import DiscussionFilter from '~/notes/components/mr_discussion_filter.vue';
import {
  MR_FILTER_OPTIONS,
  MR_FILTER_TRACKING_OPENED,
  MR_FILTER_TRACKING_USER_COMMENTS,
} from '~/notes/constants';

Vue.use(Vuex);

describe('Merge request discussion filter component', () => {
  let wrapper;
  let store;
  let updateMergeRequestFilters;
  let setDiscussionSortDirection;

  function createComponent(mergeRequestFilters = MR_FILTER_OPTIONS.map((f) => f.value)) {
    updateMergeRequestFilters = jest.fn();
    setDiscussionSortDirection = jest.fn();

    store = new Vuex.Store({
      modules: {
        notes: {
          state: {
            mergeRequestFilters,
            discussionSortOrder: 'asc',
          },
          actions: {
            updateMergeRequestFilters,
            setDiscussionSortDirection,
          },
        },
      },
    });

    wrapper = mount(DiscussionFilter, {
      store,
    });
  }

  function findDropdownItem({ value }) {
    return wrapper.findComponent(GlCollapsibleListbox).find(`[data-testid=listbox-item-${value}]`);
  }

  afterEach(() => {
    localStorage.removeItem('mr_activity_filters');
    localStorage.removeItem('sort_direction_merge_request');
  });

  describe('local sync sort direction', () => {
    it('calls setDiscussionSortDirection when mounted', () => {
      localStorage.setItem('sort_direction_merge_request', 'desc');

      createComponent();

      expect(setDiscussionSortDirection).toHaveBeenCalledWith(expect.anything(), {
        direction: 'desc',
      });
    });
  });

  describe('local sync sort filters', () => {
    it('calls setDiscussionSortDirection when mounted', () => {
      localStorage.setItem('mr_activity_filters_2', '["comments"]');

      createComponent();

      expect(updateMergeRequestFilters).toHaveBeenCalledWith(expect.anything(), ['comments']);
    });
  });

  it('lists current filters', () => {
    createComponent();

    expect(wrapper.findAllComponents(GlListboxItem)).toHaveLength(MR_FILTER_OPTIONS.length);
  });

  it('updates store when selecting filter', async () => {
    createComponent();

    wrapper.findComponent(GlListboxItem).vm.$emit('select');

    await nextTick();

    wrapper.findComponent(GlCollapsibleListbox).vm.$emit('hidden');

    expect(updateMergeRequestFilters).toHaveBeenCalledWith(expect.anything(), [
      'assignees_reviewers',
      'bot_comments',
      'comments',
      'commit_branches',
      'edits',
      'labels',
      'lock_status',
      'mentions',
      'status',
      'tracking',
    ]);
  });

  it.each`
    state                                    | expectedText
    ${['status']}                            | ${'Merge request status'}
    ${['status', 'comments']}                | ${'Merge request status +1 more'}
    ${[]}                                    | ${'None'}
    ${MR_FILTER_OPTIONS.map((f) => f.value)} | ${'All activity'}
  `('updates toggle text to $expectedText with $state', async ({ state, expectedText }) => {
    createComponent();

    store.state.notes.mergeRequestFilters = state;

    await nextTick();

    expect(wrapper.findComponent(GlButton).text()).toBe(expectedText);
  });

  it('when clicking de-select it de-selects all options', async () => {
    createComponent();

    wrapper.find('[data-testid="listbox-reset-button"]').vm.$emit('click');

    await nextTick();

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(0);
  });

  it('when clicking select all it selects all options', async () => {
    createComponent();

    wrapper.find('[data-testid="listbox-item-approval"]').vm.$emit('select', false);

    await nextTick();

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(10);

    wrapper.find('[data-testid="listbox-select-all-button"]').vm.$emit('click');

    await nextTick();

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(11);
  });

  describe('instrumentation', () => {
    let trackingSpy;

    beforeEach(() => {
      trackingSpy = mockTracking(undefined, window.document, jest.spyOn);
      createComponent();
    });

    it('tracks overall opens of the filter dropdown', () => {
      wrapper.findComponent(GlCollapsibleListbox).vm.$emit('shown');

      expect(trackingSpy).toHaveBeenCalledWith(
        undefined,
        MR_FILTER_TRACKING_OPENED,
        expect.any(Object),
      );
    });

    it.each`
      item          | trackingEvent
      ${'comments'} | ${MR_FILTER_TRACKING_USER_COMMENTS}
    `(
      'Send the correct event ($trackingEvent) for clicks on the filter item "$item"',
      ({ item, trackingEvent }) => {
        const entry = findDropdownItem({ value: item });

        if (entry) {
          entry.element.click();
        }

        expect(trackingSpy).toHaveBeenCalledTimes(1);
        expect(trackingSpy).toHaveBeenCalledWith(undefined, trackingEvent, expect.any(Object));
      },
    );
  });
});
