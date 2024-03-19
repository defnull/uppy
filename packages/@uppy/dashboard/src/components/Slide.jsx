import { cloneElement, toChildArray } from 'preact'
import { useEffect, useState, useRef } from 'preact/hooks'
import classNames from 'classnames'

const transitionName = 'uppy-transition-slideDownUp'
const duration = 250

/**
 * Vertical slide transition.
 *
 * This can take a _single_ child component, which _must_ accept a `className` prop.
 *
 * Currently this is specific to the `uppy-transition-slideDownUp` transition,
 * but it should be simple to extend this for any type of single-element
 * transition by setting the CSS name and duration as props.
 */
function Slide ({ children }) {
  const [cachedChildren, setCachedChildren] = useState(null);
  const [className, setClassName] = useState('');
  const enterTimeoutRef = useRef();
  const leaveTimeoutRef = useRef();
  const animationFrameRef = useRef();

  const handleEnterTransition = () => {
    setClassName(`${transitionName}-enter`);

    cancelAnimationFrame(animationFrameRef.current);
    clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = undefined;

    animationFrameRef.current = requestAnimationFrame(() => {
      setClassName(`${transitionName}-enter ${transitionName}-enter-active`);

      enterTimeoutRef.current = setTimeout(() => {
        setClassName('');
      }, duration);
    });
  };

  const handleLeaveTransition = () => {
    setClassName(`${transitionName}-leave`);

    cancelAnimationFrame(animationFrameRef.current);
    clearTimeout(enterTimeoutRef.current);
    enterTimeoutRef.current = undefined;

    animationFrameRef.current = requestAnimationFrame(() => {
      setClassName(`${transitionName}-leave ${transitionName}-leave-active`);

      leaveTimeoutRef.current = setTimeout(() => {
        setCachedChildren(null);
        setClassName('');
      }, duration);
    });
  };

  useEffect(() => {
    const child = toChildArray(children)[0];
    if (cachedChildren === child) return;

    if (child && !cachedChildren) {
      handleEnterTransition();
    } else if (cachedChildren && !child && !leaveTimeoutRef.current) {
      handleLeaveTransition();
    }

    setCachedChildren(child);
  }, [children, cachedChildren]); // Dependency array to trigger effect on children change


  useEffect(() => {
    return () => {
      clearTimeout(enterTimeoutRef.current);
      clearTimeout(leaveTimeoutRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // Cleanup useEffect

  if (!cachedChildren) return null;

  return cloneElement(cachedChildren, {
    className: classNames(className, cachedChildren.props.className),
  });
};

export default Slide
