import { TemplateSrv } from '../template_srv';

describe('templateSrv', () => {
  let _templateSrv;

  function initTemplateSrv(variables) {
    _templateSrv = new TemplateSrv();
    _templateSrv.init(variables);
  }

  describe('init', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'oogle' } }]);
    });

    it('should initialize template data', () => {
      const target = _templateSrv.replace('this.[[test]].filters');
      expect(target).toBe('this.oogle.filters');
    });
  });

  describe('replace can pass scoped vars', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'oogle' } }]);
    });

    it('should replace $test with scoped value', () => {
      const target = _templateSrv.replace('this.$test.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.mupp.filters');
    });

    it('should replace ${test} with scoped value', () => {
      const target = _templateSrv.replace('this.${test}.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.mupp.filters');
    });

    it('should replace ${test:glob} with scoped value', () => {
      const target = _templateSrv.replace('this.${test:glob}.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.mupp.filters');
    });

    it('should replace $test with scoped text', () => {
      const target = _templateSrv.replaceWithText('this.$test.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.asd.filters');
    });

    it('should replace ${test} with scoped text', () => {
      const target = _templateSrv.replaceWithText('this.${test}.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.asd.filters');
    });

    it('should replace ${test:glob} with scoped text', () => {
      const target = _templateSrv.replaceWithText('this.${test:glob}.filters', {
        test: { value: 'mupp', text: 'asd' },
      });
      expect(target).toBe('this.asd.filters');
    });
  });

  describe('getAdhocFilters', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'datasource',
          name: 'ds',
          current: { value: 'logstash', text: 'logstash' },
        },
        { type: 'adhoc', name: 'test', datasource: 'oogle', filters: [1] },
        { type: 'adhoc', name: 'test2', datasource: '$ds', filters: [2] },
      ]);
    });

    it('should return filters if datasourceName match', () => {
      const filters = _templateSrv.getAdhocFilters('oogle');
      expect(filters).toMatchObject([1]);
    });

    it('should return empty array if datasourceName does not match', () => {
      const filters = _templateSrv.getAdhocFilters('oogleasdasd');
      expect(filters).toMatchObject([]);
    });

    it('should return filters when datasourceName match via data source variable', () => {
      const filters = _templateSrv.getAdhocFilters('logstash');
      expect(filters).toMatchObject([2]);
    });
  });

  describe('replace can pass multi / all format', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'test',
          current: { value: ['value1', 'value2'] },
        },
      ]);
    });

    it('should replace $test with globbed value', () => {
      const target = _templateSrv.replace('this.$test.filters', {}, 'glob');
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace ${test} with globbed value', () => {
      const target = _templateSrv.replace('this.${test}.filters', {}, 'glob');
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace ${test:glob} with globbed value', () => {
      const target = _templateSrv.replace('this.${test:glob}.filters', {});
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace $test with piped value', () => {
      const target = _templateSrv.replace('this=$test', {}, 'pipe');
      expect(target).toBe('this=value1|value2');
    });

    it('should replace ${test} with piped value', () => {
      const target = _templateSrv.replace('this=${test}', {}, 'pipe');
      expect(target).toBe('this=value1|value2');
    });

    it('should replace ${test:pipe} with piped value', () => {
      const target = _templateSrv.replace('this=${test:pipe}', {});
      expect(target).toBe('this=value1|value2');
    });

    it('should replace ${test:pipe} with piped value and $test with globbed value', () => {
      const target = _templateSrv.replace('${test:pipe},$test', {}, 'glob');
      expect(target).toBe('value1|value2,{value1,value2}');
    });
  });

  describe('variable with all option', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'test',
          current: { value: '$__all' },
          options: [{ value: '$__all' }, { value: 'value1' }, { value: 'value2' }],
        },
      ]);
    });

    it('should replace $test with formatted all value', () => {
      const target = _templateSrv.replace('this.$test.filters', {}, 'glob');
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace ${test} with formatted all value', () => {
      const target = _templateSrv.replace('this.${test}.filters', {}, 'glob');
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace ${test:glob} with formatted all value', () => {
      const target = _templateSrv.replace('this.${test:glob}.filters', {});
      expect(target).toBe('this.{value1,value2}.filters');
    });

    it('should replace ${test:pipe} with piped value and $test with globbed value', () => {
      const target = _templateSrv.replace('${test:pipe},$test', {}, 'glob');
      expect(target).toBe('value1|value2,{value1,value2}');
    });
  });

  describe('variable with all option and custom value', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'test',
          current: { value: '$__all' },
          allValue: '*',
          options: [{ value: 'value1' }, { value: 'value2' }],
        },
      ]);
    });

    it('should replace $test with formatted all value', () => {
      const target = _templateSrv.replace('this.$test.filters', {}, 'glob');
      expect(target).toBe('this.*.filters');
    });

    it('should replace ${test} with formatted all value', () => {
      const target = _templateSrv.replace('this.${test}.filters', {}, 'glob');
      expect(target).toBe('this.*.filters');
    });

    it('should replace ${test:glob} with formatted all value', () => {
      const target = _templateSrv.replace('this.${test:glob}.filters', {});
      expect(target).toBe('this.*.filters');
    });

    it('should not escape custom all value', () => {
      const target = _templateSrv.replace('this.$test', {}, 'regex');
      expect(target).toBe('this.*');
    });
  });

  describe('lucene format', () => {
    it('should properly escape $test with lucene escape sequences', () => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'value/4' } }]);
      const target = _templateSrv.replace('this:$test', {}, 'lucene');
      expect(target).toBe('this:value\\/4');
    });

    it('should properly escape ${test} with lucene escape sequences', () => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'value/4' } }]);
      const target = _templateSrv.replace('this:${test}', {}, 'lucene');
      expect(target).toBe('this:value\\/4');
    });

    it('should properly escape ${test:lucene} with lucene escape sequences', () => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'value/4' } }]);
      const target = _templateSrv.replace('this:${test:lucene}', {});
      expect(target).toBe('this:value\\/4');
    });
  });

  describe('format variable to string values', () => {
    it('single value should return value', () => {
      const result = _templateSrv.formatValue('test');
      expect(result).toBe('test');
    });

    it('multi value and glob format should render glob string', () => {
      const result = _templateSrv.formatValue(['test', 'test2'], 'glob');
      expect(result).toBe('{test,test2}');
    });

    it('multi value and lucene should render as lucene expr', () => {
      const result = _templateSrv.formatValue(['test', 'test2'], 'lucene');
      expect(result).toBe('("test" OR "test2")');
    });

    it('multi value and regex format should render regex string', () => {
      const result = _templateSrv.formatValue(['test.', 'test2'], 'regex');
      expect(result).toBe('(test\\.|test2)');
    });

    it('multi value and pipe should render pipe string', () => {
      const result = _templateSrv.formatValue(['test', 'test2'], 'pipe');
      expect(result).toBe('test|test2');
    });

    it('multi value and distributed should render distributed string', () => {
      const result = _templateSrv.formatValue(['test', 'test2'], 'distributed', {
        name: 'build',
      });
      expect(result).toBe('test,build=test2');
    });

    it('multi value and distributed should render when not string', () => {
      const result = _templateSrv.formatValue(['test'], 'distributed', {
        name: 'build',
      });
      expect(result).toBe('test');
    });

    it('multi value and csv format should render csv string', () => {
      const result = _templateSrv.formatValue(['test', 'test2'], 'csv');
      expect(result).toBe('test,test2');
    });

    it('slash should be properly escaped in regex format', () => {
      const result = _templateSrv.formatValue('Gi3/14', 'regex');
      expect(result).toBe('Gi3\\/14');
    });
  });

  describe('can check if variable exists', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'oogle' } }]);
    });

    it('should return true if exists', () => {
      const result = _templateSrv.variableExists('$test');
      expect(result).toBe(true);
    });
  });

  describe('can highlight variables in string', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'oogle' } }]);
    });

    it('should insert html', () => {
      const result = _templateSrv.highlightVariablesAsHtml('$test');
      expect(result).toBe('<span class="template-variable">$test</span>');
    });

    it('should insert html anywhere in string', () => {
      const result = _templateSrv.highlightVariablesAsHtml('this $test ok');
      expect(result).toBe('this <span class="template-variable">$test</span> ok');
    });

    it('should ignore if variables does not exist', () => {
      const result = _templateSrv.highlightVariablesAsHtml('this $google ok');
      expect(result).toBe('this $google ok');
    });
  });

  describe('updateTemplateData with simple value', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: 'muuuu' } }]);
    });

    it('should set current value and update template data', () => {
      const target = _templateSrv.replace('this.[[test]].filters');
      expect(target).toBe('this.muuuu.filters');
    });
  });

  describe('fillVariableValuesForUrl with multi value', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'test',
          current: { value: ['val1', 'val2'] },
          getValueForUrl: function() {
            return this.current.value;
          },
        },
      ]);
    });

    it('should set multiple url params', () => {
      const params = {};
      _templateSrv.fillVariableValuesForUrl(params);
      expect(params['var-test']).toMatchObject(['val1', 'val2']);
    });
  });

  describe('fillVariableValuesForUrl skip url sync', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          name: 'test',
          skipUrlSync: true,
          current: { value: 'value' },
          getValueForUrl: function() {
            return this.current.value;
          },
        },
      ]);
    });

    it('should not include template variable value in url', () => {
      const params = {};
      _templateSrv.fillVariableValuesForUrl(params);
      expect(params['var-test']).toBe(undefined);
    });
  });

  describe('fillVariableValuesForUrl with multi value with skip url sync', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'test',
          skipUrlSync: true,
          current: { value: ['val1', 'val2'] },
          getValueForUrl: function() {
            return this.current.value;
          },
        },
      ]);
    });

    it('should not include template variable value in url', () => {
      const params = {};
      _templateSrv.fillVariableValuesForUrl(params);
      expect(params['var-test']).toBe(undefined);
    });
  });

  describe('fillVariableValuesForUrl with multi value and scopedVars', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: ['val1', 'val2'] } }]);
    });

    it('should set scoped value as url params', () => {
      const params = {};
      _templateSrv.fillVariableValuesForUrl(params, {
        test: { value: 'val1' },
      });
      expect(params['var-test']).toBe('val1');
    });
  });

  describe('fillVariableValuesForUrl with multi value, scopedVars and skip url sync', () => {
    beforeEach(() => {
      initTemplateSrv([{ type: 'query', name: 'test', current: { value: ['val1', 'val2'] } }]);
    });

    it('should not set scoped value as url params', () => {
      const params = {};
      _templateSrv.fillVariableValuesForUrl(params, {
        test: { name: 'test', value: 'val1', skipUrlSync: true },
      });
      expect(params['var-test']).toBe(undefined);
    });
  });

  describe('replaceWithText', () => {
    beforeEach(() => {
      initTemplateSrv([
        {
          type: 'query',
          name: 'server',
          current: { value: '{asd,asd2}', text: 'All' },
        },
        {
          type: 'interval',
          name: 'period',
          current: { value: '$__auto_interval_interval', text: 'auto' },
        },
      ]);
      _templateSrv.setGrafanaVariable('$__auto_interval_interval', '13m');
      _templateSrv.updateTemplateData();
    });

    it('should replace with text except for grafanaVariables', () => {
      const target = _templateSrv.replaceWithText('Server: $server, period: $period');
      expect(target).toBe('Server: All, period: 13m');
    });
  });

  describe('built in interval variables', () => {
    beforeEach(() => {
      initTemplateSrv([]);
    });

    it('should replace $__interval_ms with interval milliseconds', () => {
      const target = _templateSrv.replace('10 * $__interval_ms', {
        __interval_ms: { text: '100', value: '100' },
      });
      expect(target).toBe('10 * 100');
    });
  });
});
