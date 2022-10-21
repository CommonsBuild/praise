import {
  faPrayingHands,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { PraiseTable } from './components/PraiseTable';
import { MyPraiseTable } from './components/MyPraiseTable';

const StartPage = (): JSX.Element => {
  const pageViews = {
    praiseView: 1,
    myPraiseView: 2,
  };

  const [view, setView] = useState<number>(pageViews.praiseView);

  return (
    <Page>
      <BreadCrumb name="Praise" icon={faPrayingHands} />
      <ActiveNoticesBoard />

      <div className="mb-5">
        <Button
          variant={'outline'}
          className={`rounded-r-none  ${
            view === pageViews.myPraiseView
              ? 'bg-opacity-50 text-opacity-50 hover:border-themecolor-4'
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.praiseView)}
        >
          <FontAwesomeIcon icon={faUsers} size="1x" className="mr-2" />
          All Praise
        </Button>
        <Button
          variant={'outline'}
          className={`rounded-l-none  ${
            view === pageViews.praiseView
              ? 'bg-opacity-50  text-opacity-50 hover:border-themecolor-4 '
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.myPraiseView)}
        >
          <FontAwesomeIcon icon={faUser} size="1x" className="mr-2" />
          My Praise
        </Button>
      </div>

      <Box className="p-0">
        {view === pageViews.praiseView ? <PraiseTable /> : <MyPraiseTable />}
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
