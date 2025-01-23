import type { Preview } from "@storybook/react";
// antd css
import 'antd/dist/reset.css'; // 如果使用 antd v5  

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      source: {
        type: 'code',
      }
    }
  },
};

export default preview;
