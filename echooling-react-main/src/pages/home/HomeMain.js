import React from 'react';
import Blog from './BlogSection';
import About from './AboutSection';
import Service from './ServiceSection';
import HomeSlider from './SliderSection';

import Course from './CourseSection';
import Event from './EventSection';
import Counter from './CounterSection';

import ScrollToTop from '../../components/ScrollTop';

const HomeMain =() => {
		return (
			<>
				<div className="react-wrapper">
            		<div className="react-wrapper-inner">
					<HomeSlider />
						<About />


						<Course />

				

						
						<Service />
					
						
						
						<Counter />
					
						<Event />
						

					
						<Blog />
					
						<ScrollToTop
							scrollClassName="home react__up___scroll"
						/>
					
					</div>
				</div>

			</>
		);
	}

export default HomeMain;