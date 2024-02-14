import React from "react";
import { registerVevComponent } from "@vev/react";
import styles from './ScrollContainer.module.css';

type Props = {
  className: string;
  children: React.ReactNode;
};

const ScrollContainer = ({ className, children  }: Props) => {
  return (
    <div className={`${className} ${styles.container}`} >
      {children}
    </div>
  );
};

registerVevComponent(ScrollContainer, {
  name: "ScrollContainer",
  type: 'action',
});

export default ScrollContainer;
