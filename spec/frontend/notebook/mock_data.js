export const relativeRawPath = '/test';
export const markdownCellContent = ['# Test'];
export const errorOutputContent = [
  '\u001b[0;31m---------------------------------------------------------------------------\u001b[0m',
  '\u001b[0;31mNameError\u001b[0m                                 Traceback (most recent call last)',
  '\u001b[0;32m/var/folders/cq/l637k4x13gx6y9p_gfs4c_gc0000gn/T/ipykernel_79203/294318627.py\u001b[0m in \u001b[0;36m<module>\u001b[0;34m\u001b[0m\n\u001b[0;32m----> 1\u001b[0;31m \u001b[0mTo\u001b[0m\u001b[0;34m\u001b[0m\u001b[0;34m\u001b[0m\u001b[0m\n\u001b[0m',
  "\u001b[0;31mNameError\u001b[0m: name 'To' is not defined",
];
export const outputWithDataframeContent = [
  '<div>\n',
  '<style scoped>\n',
  '    .dataframe tbody tr th:only-of-type {\n',
  '        vertical-align: middle;\n',
  '    }\n',
  '\n',
  '    .dataframe tbody tr th {\n',
  '        vertical-align: top;\n',
  '    }\n',
  '\n',
  '    .dataframe thead th {\n',
  '        text-align: right;\n',
  '    }\n',
  '</style>\n',
  '<table border="1" class="dataframe">\n',
  '  <thead>\n',
  '    <tr style="text-align: right;">\n',
  '      <th></th>\n',
  '      <th>column_1</th>\n',
  '      <th>column_2</th>\n',
  '    </tr>\n',
  '  </thead>\n',
  '  <tbody>\n',
  '    <tr>\n',
  '      <th>0</th>\n',
  '      <td>abc de f</td>\n',
  '      <td>a</td>\n',
  '    </tr>\n',
  '    <tr>\n',
  '      <th>1</th>\n',
  '      <td>True</td>\n',
  '      <td>0.1</td>\n',
  '    </tr>\n',
  '  </tbody>\n',
  '</table>\n',
  '</div>',
];

export const outputWithDataframe = {
  data: {
    'text/html': outputWithDataframeContent,
  },
};
