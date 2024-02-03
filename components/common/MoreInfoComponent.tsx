import { Show } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import React from 'react';

const MoreInfoComponent: React.FC<{ show: Show; type: string }> = ({
  show,
  type,
}) => {
  return (
    <div className="  w-full pb-2.5 flex gap-5 flex-col">
      {show.overview && (
        <div className="font-bold">
          Overview : <span className="font-normal">{show.overview}</span>
        </div>
      )}
      {(show.release_date || show.first_air_date) && (
        <div className="font-bold">
          Release Date :{' '}
          <span className="font-normal">
            {formatRelativeTime(show.release_date || show.first_air_date)}
          </span>
        </div>
      )}
      {show.spoken_languages && (
        <div className="font-bold">
          Language :{' '}
          <span className="font-normal ">
            {show.spoken_languages?.[0]?.english_name}
          </span>
        </div>
      )}
      {show?.origin_country?.length! > 0 && (
        <div className="font-bold">
          Origin :{' '}
          <span className="font-normal uppercase">
            {show?.origin_country?.join(', ')}
          </span>
        </div>
      )}
      {type === 'tv' && show.status && (
        <div className="font-bold">
          Status : <span className="font-normal">{show.status}</span>
        </div>
      )}
      {type === 'tv' && show?.last_air_date && (
        <div className="font-bold">
          Last Air Date :{' '}
          <span className="font-normal">{formatRelativeTime(show.last_air_date)}</span>
        </div>
      )}
      {type === 'tv' && show?.number_of_seasons && show?.number_of_episodes && (
        <div className="font-bold">
          Seasons / episodes :{' '}
          <span className="font-normal">
            {show.number_of_seasons} seasons {show.number_of_episodes} episodes
          </span>
        </div>
      )}
      {type === 'movie' && show.runtime && (
        <>
          <div className="font-bold">
            Runtime :{' '}
            <span className="font-normal">{show.runtime} minutes</span>
          </div>
          {/* <div className="font-bold">
            Estimated Finish Time:{' '}
            <span className="font-normal">
              {calculateEndTime(show.runtime)}
            </span>
          </div> */}
        </>
      )}
      {type === 'movie' && show.budget ? (
        <div className="font-bold">
          Budget : <span className="font-normal">${show.budget}</span>
        </div>
      ) : (
        ''
      )}
      {type === 'movie' && show.revenue ? (
        <div className="font-bold">
          Revenue : <span className="font-normal">${show.revenue}</span>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default MoreInfoComponent;
