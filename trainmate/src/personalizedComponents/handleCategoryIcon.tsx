import {FitnessCenter as DumbbellIcon, 
    SportsSoccer as BallIcon, 
    SportsBasketball as BasketballIcon, 
    SportsTennis as TennisIcon, 
    SportsKabaddi as FightIcon,
    SportsMartialArts as MartialIcon,
    SportsMma as MmaIcon,
    SportsMotorsports as MotorsportsIcon,
    Hiking as HikingIcon,
    Sailing as SailingIcon,
    DownhillSkiing as SkiingIcon,
    Pool as PoolIcon,
    Skateboarding as SkateIcon,
    SportsRugby as RugbyIcon,
    SportsVolleyball as VolleyballIcon, 
    Favorite as HeartIcon,
    SelfImprovement as YogaIcon} from '@mui/icons-material';

export default function handleCategoryIcon(icon: string) {
    switch (icon) {
        case 'Dumbbell':
        return <DumbbellIcon />;
        case 'Ball':
        return <BallIcon />;
        case 'Heart':
        return <HeartIcon />;
        case 'Basketball':
        return <BasketballIcon />;
        case 'Tennis':
        return <TennisIcon />;
        case 'Fight':
        return <FightIcon />;
        case 'Martial':
        return <MartialIcon />;
        case 'Mma':
        return <MmaIcon />;
        case 'Motorsports':
        return <MotorsportsIcon />;
        case 'Hiking':
        return <HikingIcon />;
        case 'Sailing':
        return <SailingIcon />;
        case 'Skiing':
        return <SkiingIcon />;
        case 'Pool':
        return <PoolIcon />;
        case 'Skate':
        return <SkateIcon />;
        case 'Rugby':
        return <RugbyIcon />;
        case 'Volleyball':
        return <VolleyballIcon />;
        case 'Yoga':
        return <YogaIcon />;
        default:
        return null;
    }
}